"use client";

import { useEffect } from "react";

import {
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Info,
    X,
} from "lucide-react";

const styles = {
    success: {
        icon: CheckCircle2,
        accent: "border-green-500",
        iconColor: "text-green-600",
    },
    warning: {
        icon: AlertTriangle,
        accent: "border-yellow-500",
        iconColor: "text-yellow-600",
    },
    error: {
        icon: XCircle,
        accent: "border-red-500",
        iconColor: "text-red-600",
    },
    info: {
        icon: Info,
        accent: "border-blue-500",
        iconColor: "text-blue-600",
    },
};

export default function Toast({
    open,
    type = "success",
    title,
    message,
    duration = 5000,
    onClose,
}) {
    useEffect(() => {
        if (!open) return;

        const timer = setTimeout(() => {
            onClose?.();
        }, duration);

        return () => clearTimeout(timer);
    }, [open, duration, onClose]);

    if (!open) return null;

    const config = styles[type];
    const Icon = config.icon;

    return (
        <div className="fixed top-5 right-5 z-999999 animate-in slide-in-from-right duration-300">

            <div
                className={`
                    w-90
                    rounded-3xl
                    border-l-4
                    ${config.accent}
                    bg-white/90
                    backdrop-blur-xl
                    shadow-xl
                    p-5
                `}
            >
                <div className="flex gap-4">

                    <Icon
                        size={26}
                        className={config.iconColor}
                    />

                    <div className="flex-1">

                        <div className="font-semibold text-blue-950">
                            {title}
                        </div>

                        <div className="text-sm text-gray-600 mt-1 leading-relaxed">
                            {message}
                        </div>

                    </div>

                    <button
                        onClick={onClose}
                        className="cursor-pointer"
                    >
                        <X size={18} />
                    </button>

                </div>
            </div>

        </div>
    );
}