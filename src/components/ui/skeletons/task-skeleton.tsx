import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export function TaskSkeleton() {
    return (
        <Card className="w-full gap-1 py-0 overflow-hidden border-l-4 border-l-gray-300">
            <CardHeader className="flex flex-row items-center justify-between py-3 bg-gray-100/50">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-8 w-48" />
                </div>

                <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                </div>
            </CardHeader>

            <CardContent className="space-y-2 pt-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </CardContent>

            <div className="flex items-center justify-center mx-4">
                <Separator className="my-0" />
            </div>

            <CardFooter className="justify-between space-x-2 pb-3">
                <div className="flex lg:flex-row flex-col lg:items-center lg:justify-start justify-center gap-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-4 hidden lg:block" />
                    <Skeleton className="h-4 w-48" />
                </div>

                <div className="flex gap-2 justify-end">
                    <Skeleton className="h-9 w-9" />
                    <Skeleton className="h-9 w-9" />
                </div>
            </CardFooter>
        </Card>
    );
}
