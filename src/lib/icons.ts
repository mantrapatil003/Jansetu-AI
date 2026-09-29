import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function getIcon(name: string | null | undefined): LucideIcon {
  if (!name) return LucideIcons.FileText;
  const iconMap: Record<string, LucideIcon> = {
    FileText: LucideIcons.FileText,
    FolderOpen: LucideIcons.FolderOpen,
    GraduationCap: LucideIcons.GraduationCap,
    HeartPulse: LucideIcons.HeartPulse,
    Briefcase: LucideIcons.Briefcase,
    HandHeart: LucideIcons.HandHeart,
    ClipboardList: LucideIcons.ClipboardList,
    MoreHorizontal: LucideIcons.MoreHorizontal,
  };
  return iconMap[name] || LucideIcons.FileText;
}
