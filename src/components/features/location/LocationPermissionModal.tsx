import React, { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import Modal from "../../common/Modal/Modal";
import Button from "../../common/Button/Button";

const LocationPermissionModal: React.FC = () => {
    const [status, setStatus] = useState<PermissionState | "default">("default");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isRequesting, setIsRequesting] = useState(false);

    useEffect(() => {
        const checkPermission = async () => {
            if (!("geolocation" in navigator)) {
                setLoading(false);
                return;
            }

            try {
                const permission = await navigator.permissions.query({ name: "geolocation" });
                setStatus(permission.state);
                
                // Commenting this out because forcing the location modal globally might be annoying.
                // Usually we only show it on Attendance pages, but the user said "same for location allow",
                // meaning they want the same modal block. Let's block them if denied or prompt.
                if (permission.state === "prompt" || permission.state === "denied") {
                    setOpen(true);
                }
                
                permission.onchange = () => {
                    setStatus(permission.state);
                    if (permission.state === "granted") {
                        setOpen(false);
                    } else if (permission.state === "denied" || permission.state === "prompt") {
                        setOpen(true);
                    }
                };
            } catch (error) {
                console.error("Error checking location permission:", error);
            } finally {
                setLoading(false);
            }
        };
        
        checkPermission();
    }, []);

    const handleEnable = () => {
        if (!("geolocation" in navigator)) {
            alert("Your browser does not support geolocation");
            return;
        }

        setIsRequesting(true);
        navigator.geolocation.getCurrentPosition(
            () => {
                setStatus("granted");
                setOpen(false);
                setIsRequesting(false);
            },
            (error) => {
                setIsRequesting(false);
                if (error.code === error.PERMISSION_DENIED) {
                    setStatus("denied");
                    alert(
                        "Location access is blocked.\n\n" +
                        "To enable:\n" +
                        "1. Click the site settings icon (🔒 or ⓘ) near the address bar\n" +
                        "2. Set Location to 'Allow'\n" +
                        "3. Refresh the page"
                    );
                }
            }
        );
    };

    if (loading || !open) return null;

    const isDenied = status === "denied";

    return (
        <Modal
            open={open}
            onClose={() => { }}
            title={isDenied ? "Location Blocked" : "Enable Location"}
            maxWidth="sm"
            isDismissible={false}
            actions={
                <Button
                    onClick={handleEnable}
                    variant="default"
                    className="w-full"
                    loading={isRequesting}
                >
                    {isDenied ? "Enable Location" : "Enable Location"}
                </Button>
            }
        >
            <div className="flex flex-col items-center text-center space-y-4 py-2">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <MapPin className="w-8 h-8" />
                </div>

                <div>
                    <p className="text-foreground font-medium mb-1">
                        {isDenied
                            ? "Location access is blocked"
                            : "Allow location access"}
                    </p>

                    <p className="text-sm text-foreground-secondary">
                        {isDenied
                            ? "You have blocked location access for this site. Click the button above for instructions on how to re-enable it."
                            : "Enable location access to allow for accurate attendance tracking and check-ins."
                        }
                    </p>
                </div>
            </div>
        </Modal>
    );
};

export default LocationPermissionModal;
