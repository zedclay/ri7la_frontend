export function coverForCarMake(make?: string | null) {
  const m = (make ?? "").toLowerCase();
  if (m.includes("dacia")) {
    return "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1600&q=80";
  }
  if (m.includes("hyundai")) {
    return "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1600&q=80";
  }
  if (m.includes("renault")) {
    return "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1600&q=80";
  }
  return "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1600&q=80";
}

export function busCoverImage() {
  return "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1600&q=80";
}

export function trainCoverImage() {
  return "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80";
}
