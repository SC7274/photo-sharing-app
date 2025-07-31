import * as React from "react"

export default function HeroSection() {
    return (
        <section style={{ padding: "4rem 2rem", background: "#f5f5f5" }}>
            <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem", color:"#555" }}>Welcome to My Photo Sharing App</h1>
            <p style={{ fontSize: "1.25rem", color: "#555" }}>
                Share your favorite moments with friends and family. Upload, explore, and enjoy beautiful photos!
            </p>
        </section>
    );
}