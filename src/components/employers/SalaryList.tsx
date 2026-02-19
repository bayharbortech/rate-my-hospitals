import { Salary } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Actually, I'll use a simple list for now to keep it simple and fast, or standard HTML table.
// Let's use standard HTML table with Tailwind classes for speed.

interface SalaryListProps {
    salaries: Salary[];
}

export function SalaryList({ salaries }: SalaryListProps) {
    if (salaries.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No salary data submitted yet. Be the first to share!
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Nurse Salaries</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-slate-50">
                            <tr>
                                <th className="px-4 py-3">Position</th>
                                <th className="px-4 py-3">Department</th>
                                <th className="px-4 py-3">Experience</th>
                                <th className="px-4 py-3">Hourly Rate</th>
                                <th className="px-4 py-3">Differential</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salaries.map((salary) => (
                                <tr key={salary.id} className="border-b hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium">{salary.position}</td>
                                    <td className="px-4 py-3">{salary.department}</td>
                                    <td className="px-4 py-3">{salary.years_experience} yrs</td>
                                    <td className="px-4 py-3 font-bold text-green-700">
                                        ${salary.hourly_rate.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {salary.shift_differential ? `+$${salary.shift_differential.toFixed(2)}` : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="text-xs text-muted-foreground mt-4 text-center">
                    *Self-reported data. Rates may vary based on education, certifications, and negotiation.
                </p>
            </CardContent>
        </Card>
    );
}
