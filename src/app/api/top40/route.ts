import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export interface Top40Employer {
    employer_id: string;
    employer_name: string;
    city: string;
    state: string;
    type: string;
    review_count: number;
    avg_overall: number;
    avg_staffing: number;
    avg_safety: number;
    avg_culture: number;
    avg_management: number;
    avg_pay: number;
    avg_cattiness: number | null;
    common_patient_load: string | null;
    has_salary_data: boolean;
    has_interview_data: boolean;
    avg_hourly_rate: number | null;
    positions: string[];
    departments: string[];
}

export interface Top40Filters {
    states: string[];
    departments: string[];
    positions: string[];
}

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Parse filter params
    const state = searchParams.get('state') || '';
    const sortBy = searchParams.get('sortBy') || 'avg_overall';
    const department = searchParams.get('department') || '';
    const position = searchParams.get('position') || '';

    // Build review query — only approved reviews
    let reviewQuery = supabase
        .from('reviews')
        .select('employer_id, rating_overall, rating_staffing, rating_safety, rating_culture, rating_management, rating_pay_benefits, rating_cattiness, patient_load, department, position_type')
        .eq('status', 'approved');

    if (department) {
        reviewQuery = reviewQuery.eq('department', department);
    }
    if (position) {
        reviewQuery = reviewQuery.eq('position_type', position);
    }

    const { data: reviews, error: reviewError } = await reviewQuery;

    if (reviewError) {
        return NextResponse.json({ error: reviewError.message }, { status: 500 });
    }

    // Fetch employers (with optional state filter)
    let employerQuery = supabase.from('employers').select('id, name, city, state, type');
    if (state) {
        employerQuery = employerQuery.eq('state', state);
    }
    const { data: employers, error: empError } = await employerQuery;

    if (empError) {
        return NextResponse.json({ error: empError.message }, { status: 500 });
    }

    // Build employer lookup
    const empMap = new Map<string, { name: string; city: string; state: string; type: string }>();
    for (const emp of employers || []) {
        empMap.set(emp.id, { name: emp.name, city: emp.city, state: emp.state, type: emp.type });
    }

    // Aggregate reviews by employer
    const agg = new Map<string, {
        count: number;
        sumOverall: number; sumStaffing: number; sumSafety: number;
        sumCulture: number; sumManagement: number; sumPay: number;
        sumCattiness: number; cattinessCount: number;
        patientLoads: string[];
        departments: Set<string>;
        positions: Set<string>;
    }>();

    for (const r of reviews || []) {
        // Skip reviews from employers not matching state filter
        if (!empMap.has(r.employer_id)) continue;

        let bucket = agg.get(r.employer_id);
        if (!bucket) {
            bucket = {
                count: 0,
                sumOverall: 0, sumStaffing: 0, sumSafety: 0,
                sumCulture: 0, sumManagement: 0, sumPay: 0,
                sumCattiness: 0, cattinessCount: 0,
                patientLoads: [],
                departments: new Set(),
                positions: new Set(),
            };
            agg.set(r.employer_id, bucket);
        }
        bucket.count++;
        bucket.sumOverall += r.rating_overall;
        bucket.sumStaffing += r.rating_staffing;
        bucket.sumSafety += r.rating_safety;
        bucket.sumCulture += r.rating_culture;
        bucket.sumManagement += r.rating_management;
        bucket.sumPay += r.rating_pay_benefits;
        if (r.rating_cattiness) {
            bucket.sumCattiness += r.rating_cattiness;
            bucket.cattinessCount++;
        }
        if (r.patient_load) bucket.patientLoads.push(r.patient_load);
        if (r.department) bucket.departments.add(r.department);
        if (r.position_type) bucket.positions.add(r.position_type);
    }

    // Fetch salary and interview existence per employer
    const employerIds = [...agg.keys()];
    const [salaryRes, interviewRes] = await Promise.all([
        supabase.from('salaries').select('employer_id, hourly_rate').in('employer_id', employerIds.length > 0 ? employerIds : ['']),
        supabase.from('interviews').select('employer_id').in('employer_id', employerIds.length > 0 ? employerIds : ['']),
    ]);

    // Salary aggregation
    const salaryMap = new Map<string, { total: number; count: number }>();
    for (const s of salaryRes.data || []) {
        let entry = salaryMap.get(s.employer_id);
        if (!entry) {
            entry = { total: 0, count: 0 };
            salaryMap.set(s.employer_id, entry);
        }
        entry.total += s.hourly_rate;
        entry.count++;
    }

    const interviewSet = new Set((interviewRes.data || []).map(i => i.employer_id));

    // Mode helper for patient load
    function mode(arr: string[]): string | null {
        if (arr.length === 0) return null;
        const freq = new Map<string, number>();
        for (const v of arr) freq.set(v, (freq.get(v) || 0) + 1);
        let best = arr[0];
        let bestCount = 0;
        for (const [val, cnt] of freq) {
            if (cnt > bestCount) { best = val; bestCount = cnt; }
        }
        return best;
    }

    // Build result array
    const results: Top40Employer[] = [];
    for (const [empId, bucket] of agg) {
        const emp = empMap.get(empId);
        if (!emp) continue;

        const salaryEntry = salaryMap.get(empId);

        results.push({
            employer_id: empId,
            employer_name: emp.name,
            city: emp.city,
            state: emp.state,
            type: emp.type,
            review_count: bucket.count,
            avg_overall: +(bucket.sumOverall / bucket.count).toFixed(2),
            avg_staffing: +(bucket.sumStaffing / bucket.count).toFixed(2),
            avg_safety: +(bucket.sumSafety / bucket.count).toFixed(2),
            avg_culture: +(bucket.sumCulture / bucket.count).toFixed(2),
            avg_management: +(bucket.sumManagement / bucket.count).toFixed(2),
            avg_pay: +(bucket.sumPay / bucket.count).toFixed(2),
            avg_cattiness: bucket.cattinessCount > 0
                ? +(bucket.sumCattiness / bucket.cattinessCount).toFixed(2)
                : null,
            common_patient_load: mode(bucket.patientLoads),
            has_salary_data: !!salaryEntry,
            has_interview_data: interviewSet.has(empId),
            avg_hourly_rate: salaryEntry
                ? +(salaryEntry.total / salaryEntry.count).toFixed(2)
                : null,
            positions: [...bucket.positions].sort(),
            departments: [...bucket.departments].sort(),
        });
    }

    // Sort
    const sortKey = sortBy as keyof Top40Employer;
    results.sort((a, b) => {
        const aVal = a[sortKey] ?? 0;
        const bVal = b[sortKey] ?? 0;
        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return bVal - aVal; // descending
        }
        return 0;
    });

    // Top 40
    const top40 = results.slice(0, 40);

    // Also return available filter values
    const allStates = [...new Set((employers || []).map(e => e.state))].sort();
    const allDepartments = [...new Set((reviews || []).map(r => r.department).filter(Boolean))].sort() as string[];
    const allPositions = [...new Set((reviews || []).map(r => r.position_type).filter(Boolean))].sort() as string[];

    return NextResponse.json({
        employers: top40,
        filters: {
            states: allStates,
            departments: allDepartments,
            positions: allPositions,
        } as Top40Filters,
    });
}
