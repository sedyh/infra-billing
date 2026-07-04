import { IconArrowDown, IconArrowUp, IconArrowsSort } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { TableHead } from '@/components/ui/table';
import type { SortDir } from '@/hooks/useTableSort';
import { cn } from '@/lib/utils';

interface SortableTableHeadProps {
  /** Already-translated column label — it is also the button's accessible name. */
  label: string;
  /** This column's direction, or null when it is not the active sort key. */
  active: SortDir | null;
  onToggle: () => void;
  className?: string;
}

export function SortableTableHead({ label, active, onToggle, className }: SortableTableHeadProps) {
  return (
    <TableHead
      aria-sort={active === 'asc' ? 'ascending' : active === 'desc' ? 'descending' : undefined}
      className={cn('text-muted-foreground', className)}
    >
      {/* -ml-2/px-2 keeps the label at the th's 12px content edge (like plain headers)
          while the button edge stays 4px in, so the 3px focus ring isn't clipped by the
          overflow-x-auto wrapper. has-[>svg]:px-2 overrides the size="sm" svg padding;
          text-[15px] matches the table font (Button size="sm" is text-sm otherwise). */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="-ml-2 gap-1 px-2 text-[15px] text-muted-foreground has-[>svg]:px-2"
      >
        {label}
        {active === 'asc' ? (
          <IconArrowUp className="size-3.5" />
        ) : active === 'desc' ? (
          <IconArrowDown className="size-3.5" />
        ) : (
          <IconArrowsSort className="size-3.5 opacity-40" />
        )}
      </Button>
    </TableHead>
  );
}
