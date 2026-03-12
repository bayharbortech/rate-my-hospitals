'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
    X, Building2, Award, Users, GraduationCap,
    Sun, Moon, RefreshCw, DollarSign,
} from 'lucide-react';
import { useEmployerFiltersStore } from '@/stores/useEmployerFiltersStore';

const ALL_SPECIALTIES = ['ICU', 'ER', 'Med-Surg', 'L&D', 'NICU', 'Cardiac', 'Oncology', 'Neuro', 'Ortho', 'Psych'];

interface MobileFilterOverlayProps {
    resultCount: number;
    onClose: () => void;
}

export function MobileFilterOverlay({ resultCount, onClose }: MobileFilterOverlayProps) {
    const {
        selectedSpecialties, magnetOnly, unionOnly, newGradOnly,
        selectedShifts, minPay,
        toggleSpecialty, setMagnetOnly, setUnionOnly, setNewGradOnly,
        toggleShift, setMinPay, clearAll,
    } = useEmployerFiltersStore();

    return (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b">
                <h2 className="text-lg font-semibold">Filters</h2>
                <div className="flex items-center gap-3">
                    <button onClick={clearAll} className="text-sm text-teal-600 font-medium">Clear All</button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-8">
                <div>
                    <Label className="text-sm font-semibold flex items-center gap-2 mb-3">
                        <Building2 className="w-4 h-4" /> Specialties / Units
                    </Label>
                    <div className="flex flex-wrap gap-2">
                        {ALL_SPECIALTIES.map(s => (
                            <button
                                key={s}
                                onClick={() => toggleSpecialty(s)}
                                className={`px-4 py-2 text-sm rounded-full border transition-colors ${
                                    selectedSpecialties.includes(s)
                                        ? 'bg-teal-600 text-white border-teal-600'
                                        : 'bg-background text-foreground border-border hover:border-teal-300'
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <Label className="text-sm font-semibold flex items-center gap-2 mb-3">
                        <Award className="w-4 h-4" /> Hospital Features
                    </Label>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm flex items-center gap-2">
                                <Award className="w-4 h-4 text-amber-500" /> Magnet Designated
                            </label>
                            <Switch checked={magnetOnly} onCheckedChange={setMagnetOnly} />
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-sm flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-500" /> Union Hospital
                            </label>
                            <Switch checked={unionOnly} onCheckedChange={setUnionOnly} />
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-sm flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-green-500" /> New Grad Friendly
                            </label>
                            <Switch checked={newGradOnly} onCheckedChange={setNewGradOnly} />
                        </div>
                    </div>
                </div>

                <div>
                    <Label className="text-sm font-semibold flex items-center gap-2 mb-3">
                        <Sun className="w-4 h-4" /> Shift Types
                    </Label>
                    <div className="space-y-4">
                        {[
                            { id: 'day', label: 'Day Shift', icon: Sun },
                            { id: 'night', label: 'Night Shift', icon: Moon },
                            { id: 'rotating', label: 'Rotating', icon: RefreshCw },
                        ].map(shift => (
                            <div key={shift.id} className="flex items-center space-x-3">
                                <Checkbox
                                    id={`mobile-${shift.id}`}
                                    checked={selectedShifts.includes(shift.id)}
                                    onCheckedChange={() => toggleShift(shift.id)}
                                />
                                <label htmlFor={`mobile-${shift.id}`} className="text-sm flex items-center gap-2 cursor-pointer">
                                    <shift.icon className="w-4 h-4" /> {shift.label}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <Label className="text-sm font-semibold flex items-center gap-2 mb-3">
                        <DollarSign className="w-4 h-4" /> Minimum Hourly Pay
                    </Label>
                    <div className="px-1 pt-2">
                        <Slider
                            value={[minPay]}
                            onValueChange={(v) => setMinPay(v[0])}
                            max={100}
                            step={5}
                            className="w-full [&_[role=slider]]:h-6 [&_[role=slider]]:w-6"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground mt-3">
                            <span>$0/hr</span>
                            <span className="font-semibold text-teal-600 text-base">${minPay}/hr+</span>
                            <span>$100/hr</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t px-4 py-3 flex items-center gap-3" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}>
                <button onClick={clearAll} className="text-sm text-muted-foreground font-medium px-3">Reset</button>
                <Button className="flex-1" onClick={onClose}>
                    Show {resultCount} {resultCount === 1 ? 'Result' : 'Results'}
                </Button>
            </div>
        </div>
    );
}
