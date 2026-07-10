import React from 'react';
import './HeroSection.css';
import { Leaf, ArrowRight } from 'lucide-react';

const renderTypewriter = (text, startDelay, isGradient = false) => {
    return text.split('').map((char, index) => {
        const delay = startDelay + (index * 0.05); // 50ms interval per letter
        return (
            <span
                key={`${char}-${index}`}
                className={`type-letter ${isGradient ? 'text-gradient' : ''}`}
                style={{ animationDelay: `${delay}s` }}
            >
                {char === ' ' ? '\u00A0' : char}
            </span>
        );
    });
};

const HeroSection = () => {
    return (
        <section id="home" className="hero">
            <div className="hero-bg">
                <div className="overlay"></div>
                <img src="/hero-bg.png" alt="Eco City Tree" className="hero-img" />
            </div>

            <div className="container hero-content">
                <div className="hero-text-wrapper animate-fade-in">
                    <div className="badge glass-panel">
                        <Leaf size={16} className="text-secondary" />
                        <span>Smart & Green Vadodara</span>
                    </div>

                    <h1 className="hero-title">
                        {renderTypewriter("Together, let's build a", 0.2)}
                        <br />
                        {renderTypewriter("Sustainable Future", 1.5, true)}
                        <span className="cursor-blink">|</span>
                    </h1>

                    <p className="hero-subtitle delay-100">
                        "He that plants trees loves others beside himself." Join Vadodara Municipal Corporation in our mission to create a clean, green, and vibrant city. Report issues easily and help us serve you better.
                    </p>

                    <div className="hero-actions delay-200">
                        <a href="#report-issue" className="btn btn-primary pulse">
                            Report an Issue <ArrowRight size={18} />
                        </a>
                        <a href="#about" className="btn btn-secondary glass-panel">
                            Our Initiatives
                        </a>
                    </div>
                </div>

                <div className="hero-stats delay-300">
                    <div className="stat-card glass-panel">
                        <h3 className="text-gradient-alt">50k+</h3>
                        <p>Trees Planted</p>
                    </div>
                    <div className="stat-card glass-panel">
                        <h3 className="text-gradient-alt">24/7</h3>
                        <p>Citizen Support</p>
                    </div>
                    <div className="stat-card glass-panel">
                        <h3 className="text-gradient-alt">100%</h3>
                        <p>Commitment</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
