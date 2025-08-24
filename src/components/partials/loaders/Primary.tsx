import React from "react";
interface PrimaryLoaderProps {
    overlay?: boolean;
}
const PrimaryLoader: React.FC<PrimaryLoaderProps> = ({ overlay = false }) => {
    return overlay ? (
        <div className="fixed inset-0 bg-gradient-to-br from-rose-400 via-orange-300 to-amber-200 flex justify-center items-center z-50">
            <svg className="w-10 h-10 animate-spin" viewBox="0 0 40 40" height="40" width="40">
                <circle className="track" cx="20" cy="20" r="17.5" pathLength="100" strokeWidth="5" fill="none"
                    style={{ stroke: "black", opacity: 0.1 }} />
                <circle className="car" cx="20" cy="20" r="17.5" pathLength="100" strokeWidth="5" fill="none"
                    style={{
                        stroke: "black",
                        strokeDasharray: "25, 75",
                        strokeDashoffset: 0,
                        strokeLinecap: "round"
                    }} />
            </svg>
        </div>
    ) : (
        <svg className="container" viewBox="0 0 40 40" height="40" width="40">
            <circle className="track" cx="20" cy="20" r="17.5" pathLength="100" strokeWidth="5" fill="none" />
            <circle className="car" cx="20" cy="20" r="17.5" pathLength="100" strokeWidth="5" fill="none" />
        </svg>
    );
};

export default PrimaryLoader;