import { Badge, Car, Info, Palette, Plus, Train, Verified, X } from 'lucide-react';
import React, { useState } from 'react'
import { toast } from 'react-toastify';

const VehiclePopup = ({ onVehicleAdded }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        Carplate: '',
        VehicleMade: '',
        VehicleModel: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    const handleAdd = async () => {
        // Validation
        if (!formData.Carplate.trim() || !formData.VehicleMade.trim() || !formData.VehicleModel.trim()) {
            toast.error("Please fill in all fields");
            return;
        }

        setIsLoading(true);
        const id = toast.loading("Adding ...");

        try {
            const response = await fetch("/api/car/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    Carplate: formData.Carplate.toUpperCase().replaceAll(' ', ''),
                    VehicleMade: formData.VehicleMade,
                    VehicleModel: formData.VehicleModel
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                toast.update(id, {
                    render: "Added Successfully",
                    type: "success",
                    isLoading: false,
                    autoClose: 2000,
                });
                setFormData({
                    Carplate: '',
                    VehicleMade: '',
                    VehicleModel: ''
                });
                setIsAdding(false);

                if (onVehicleAdded) {
                    onVehicleAdded();
                }

            } else {
                toast.update(id, {
                    render: "Failed to Add. Please ensure the details are correct",
                    type: "error",
                    isLoading: false,
                    autoClose: 2000,
                });
            }
        } catch (err) {
            console.error("Fetch crashed:", err);
            toast.update(id, {
                render: ("Add crashed:" + err),
                type: "error",
                isLoading: false,
                autoClose: 2000,
            });
        } finally {
            setIsLoading(false);
        }
    }


    return (
        <div className="w-full h-full">
            <button
                className="w-full group border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center p-8 h-full cursor-pointer shadow-sm hover:shadow-md relative overflow-hidden transition-all transition-shadow bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm hover:border-primary hover:bg-primary/5"
                onClick={() => setIsAdding(true)}
            >
                <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                    <Plus />
                </div>
                <span className="font-bold text-slate-900 dark:text-white">Add New Vehicle</span>
                <p className="text-slate-500 text-sm text-center mt-2 px-4">Register a new car for easy one-tap parking</p>
            </button>
            {isAdding ?
                <div>
                    {/* -Modal Overlay */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
                        {/* <!-- Modal Container --> */}
                        <div className="w-full min-h-[250px] max-w-[520px] bg-white dark:bg-[#192633] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            {/* <!-- Header --> */}
                            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Add New Vehicle</h2>
                                <button
                                    className="cursor-pointer p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-full transition-colors"
                                    onClick={() => setIsAdding(false)}
                                >
                                    <X />
                                </button>
                            </div>
                            {/* <!-- Form Content --> */}
                            <div className="p-6 space-y-6">
                                {/* <!-- License Plate --> */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <Verified />
                                        License Plate Number
                                    </label>
                                    <input
                                        name='Carplate'
                                        value={formData.Carplate}
                                        className="w-full h-12 px-4 rounded-lg border border-slate-200 dark:border-[#324d67] bg-slate-50 dark:bg-[#111a22] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#92adc9] focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                        placeholder="e.g., ABC-1234"
                                        type="text"
                                        onChange={handleInputChange}
                                    />
                                </div>
                                {/* <!-- Two Column Row --> */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                            <Car />
                                            Vehicle Made
                                        </label>
                                        <input
                                            name='VehicleMade'
                                            value={formData.VehicleMade}
                                            className="w-full h-12 px-4 rounded-lg border border-slate-200 dark:border-[#324d67] bg-slate-50 dark:bg-[#111a22] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#92adc9] focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                            placeholder="e.g., Toyota"
                                            type="text"
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                            <Car />
                                            Vehicle Model
                                        </label>
                                        <input
                                            name='VehicleModel'
                                            value={formData.VehicleModel}
                                            className="w-full h-12 px-4 rounded-lg border border-slate-200 dark:border-[#324d67] bg-slate-50 dark:bg-[#111a22] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#92adc9] focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                            placeholder="e.g., Camry"
                                            type="text"
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                                {/* <!-- Info Box --> */}
                                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 flex gap-3">
                                    <Info />
                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                        Ensure the license plate is accurate.
                                    </p>
                                </div>
                            </div>
                            {/* <!-- Footer Actions --> */}
                            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-[#111a22]/50">
                                <button
                                    className="cursor-pointer h-11 px-6 rounded-lg font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                    onClick={() => setIsAdding(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={isLoading} // prevent double click
                                    className="cursor-pointer h-11 px-6 rounded-lg font-bold bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                                    onClick={() => handleAdd()}
                                >
                                    <Plus />
                                    {isLoading ? "Adding ..." : "Add Vehicle"}
                                </button>
                            </div>
                        </div>
                    </div >
                </div>
                : null}
        </div>
    )
}

export default VehiclePopup
