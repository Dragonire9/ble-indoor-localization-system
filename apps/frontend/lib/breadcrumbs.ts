/**
 * Breadcrumb helper utilities for generating breadcrumb navigation
 */

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

/**
 * Generates breadcrumb items from a pathname
 * @param pathname - Current route pathname (e.g., "/beacons/123")
 * @returns Array of breadcrumb items
 */
export function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  if (!pathname || pathname === '/') {
    return [{ label: 'Dashboard', href: '/dashboard', isActive: true }];
  }

  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
  ];

  // Route label mapping
  const routeLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    beacons: 'Beacons',
    sectors: 'Sectors',
    geofences: 'Geofences',
  };

  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1;
    const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    
    // Build href from segments up to current
    const href = '/' + segments.slice(0, index + 1).join('/');
    
    breadcrumbs.push({
      label,
      href: isLast ? undefined : href,
      isActive: isLast,
    });
  });

  return breadcrumbs;
}

/**
 * Gets a readable label for a route segment
 * @param segment - Route segment (e.g., "beacons")
 * @returns Human-readable label
 */
export function getRouteLabel(segment: string): string {
  const labels: Record<string, string> = {
    dashboard: 'Dashboard',
    beacons: 'Beacons',
    sectors: 'Sectors',
    geofences: 'Geofences',
  };

  return labels[segment.toLowerCase()] || segment;
}
