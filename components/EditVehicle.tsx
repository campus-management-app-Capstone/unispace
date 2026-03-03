import { Badge, Car, Edit, Info, Palette, Plus, Save, Train, Verified, X } from 'lucide-react';
import React, { useState } from 'react'
import { toast } from 'react-toastify';

const EditVehicle = ({ onVehicleEdited, car }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        RegisteredCarID: car.RegisteredCarID,
        Carplate: car.Carplate,
        VehicleMade: car.VehicleMade,
        VehicleModel: car.VehicleModel
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    const handleSave = async () => {
        // Validation
        if (!formData.Carplate.trim() || !formData.VehicleMade.trim() || !formData.VehicleModel.trim()) {
            toast.error("Please fill in all fields");
            return;
        }

        setIsLoading(true);
        const id = toast.loading("Saving ...");

        try {
            const response = await fetch("/api/car/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    RegisteredCarID: formData.RegisteredCarID,
                    Carplate: formData.Carplate.toUpperCase().replaceAll(' ', ''),
                    VehicleMade: formData.VehicleMade,
                    VehicleModel: formData.VehicleModel
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setFormData({
                    RegisteredCarID: car.RegisteredCarID,
                    Carplate: car.Carplate,
                    VehicleMade: car.VehicleMade,
                    VehicleModel: car.VehicleModel
                });
                setIsEditing(false);
                toast.update(id, {
                    render: "Changes Saved",
                    type: "success",
                    isLoading: false,
                    autoClose: 2000,
                });

                if (onVehicleEdited) {
                    onVehicleEdited();
                }

            } else {
                toast.update(id, {
                    render: "The car plate might have registered. Please ensure the details are correct.",
                    type: "error",
                    isLoading: false,
                    autoClose: 2000,
                });
            }
        } catch (err) {
            console.error("Save crashed:", err);
            toast.update(id, {
                render: ("Save crashed:" + err),
                type: "error",
                isLoading: false,
                autoClose: 2000,
            });
        } finally {
            setIsLoading(false);
        }
    }


    return (
        <>
            <button
                className="px-3 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary rounded-lg transition-colors cursor-pointer"
                onClick={() => setIsEditing(true)}
            >
                <Edit />
            </button>
            {isEditing ?
                <div>
                    {/* -Modal Overlay */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
                        {/* <!-- Modal Container --> */}
                        <div className="w-full min-h-[250px] max-w-[520px] bg-white dark:bg-[#192633] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            {/* <!-- Header --> */}
                            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Vehicle</h2>
                                <button
                                    className="cursor-pointer p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-full transition-colors"
                                    onClick={() => {
                                        setIsEditing(false)
                                        setFormData({
                                            RegisteredCarID: car.RegisteredCarID,
                                            Carplate: car.Carplate,
                                            VehicleMade: car.VehicleMade,
                                            VehicleModel: car.VehicleModel
                                        });
                                    }}
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
                                    onClick={() => {
                                        setIsEditing(false)
                                        setFormData({
                                            RegisteredCarID: car.RegisteredCarID,
                                            Carplate: car.Carplate,
                                            VehicleMade: car.VehicleMade,
                                            VehicleModel: car.VehicleModel
                                        });
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={isLoading} // prevent double click
                                    className="cursor-pointer h-11 px-6 rounded-lg font-bold bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                                    onClick={() => handleSave()}
                                >
                                    <Save />
                                    {isLoading ? "Saving ..." : "Save Vehicle"}
                                </button>
                            </div>
                        </div>
                    </div >
                </div>
                : null}
        </>
    )
}

export default EditVehicle
