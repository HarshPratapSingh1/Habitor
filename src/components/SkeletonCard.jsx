function SkeletonCard({ height = "h-24" }) {
    return (
        <div className={`
      glass rounded-xl p-4 ${height}
      animate-pulse relative overflow-hidden
    `}>
            <div className="absolute inset-0 bg-gradient-to-r 
        from-transparent via-white/20 to-transparent 
        animate-shimmer" />
        </div>
    );
}

export default SkeletonCard;
