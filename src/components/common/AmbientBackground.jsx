import './AmbientBackground.css';

export const AmbientBackground = () => {
  return (
    <div className="ambient-background-mesh" aria-hidden="true">
      {/* Cyber Dot-Matrix Grid Overlay */}
      <div className="ambient-grid-overlay" />
      
      {/* Floating Organic Glow Orbs */}
      <div className="mesh-glow-orb orb-1" />
      <div className="mesh-glow-orb orb-2" />
      <div className="mesh-glow-orb orb-3" />
      
      {/* Subtle Moving Beam / Aurora Waves */}
      <div className="mesh-aurora-beam" />
    </div>
  );
};
