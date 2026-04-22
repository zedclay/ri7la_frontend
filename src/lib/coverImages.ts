export function coverForCarMake(make?: string | null) {
  const m = (make ?? "").toLowerCase();
  const defaultCover =
    "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1600&q=80";
  if (m.includes("dacia")) {
    return "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1600&q=80";
  }
  if (m.includes("renault") || m.includes("citro")) {
    return "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=1600&q=80";
  }
  if (m.includes("peugeot")) {
    return "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1600&q=80";
  }
  if (m.includes("hyundai") || m.includes("kia")) {
    return "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1600&q=80";
  }
  if (m.includes("toyota") || m.includes("nissan")) {
    return "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1600&q=80";
  }
  return defaultCover;
}

export function busCoverImage() {
  return "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?auto=format&fit=crop&w=1600&q=80";
}

export function trainCoverImage() {
  return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1600&q=80";
}
