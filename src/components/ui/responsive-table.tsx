import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";

interface ResponsiveTableProps<T> {
  data: T[];
  columns: {
    key: string;
    header: string;
    mobileLabel?: string;
    render?: (value: any, row: T) => ReactNode;
  }[];
  mobileCardRender?: (item: T, index: number) => ReactNode;
  onRowClick?: (item: T) => void;
}

export function ResponsiveTable<T extends Record<string, any>>({
  data,
  columns,
  mobileCardRender,
  onRowClick
}: ResponsiveTableProps<T>) {
  const isMobile = useIsMobile();

  if (isMobile && mobileCardRender) {
    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <Card 
            key={index} 
            className={`${onRowClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} touch-target`}
            onClick={() => onRowClick?.(item)}
          >
            <CardContent className="p-4">
              {mobileCardRender(item, index)}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-3 sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className="whitespace-nowrap">
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow 
                key={index}
                className={onRowClick ? 'cursor-pointer' : ''}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => {
                  const value = col.key.split('.').reduce((obj, key) => obj?.[key], row);
                  return (
                    <TableCell key={col.key} className="whitespace-nowrap">
                      {col.render ? col.render(value, row) : value}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
