export default function BackgroundEffects() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(158, 127, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(158, 127, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
      
      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] animate-pulse-slow" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[200px] animate-pulse-slow" style={{ animationDelay: '4s' }} />
      
      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${6 + Math.random() * 4}s`,
          }}
        />
      ))}
      
      {/* Hexagon pattern overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
            <polygon 
              points="25,0 50,14.4 50,43.4 25,57.7 0,43.4 0,14.4" 
              fill="none" 
              stroke="rgba(158, 127, 255, 0.3)" 
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexagons)" />
      </svg>
    </div>
  )
}
