import type { Assignment } from "@vedaai/shared";
import { AssignmentCard } from "@/components/assignments/assignment-card";

export function AssignmentGrid({
  assignments,
}: {
  assignments: Assignment[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {assignments.map((assignment) => (
        <AssignmentCard key={assignment._id} assignment={assignment} />
      ))}
    </div>
  );
}
