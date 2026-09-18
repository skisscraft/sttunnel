import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = { title: "Course" };

export default function CoursePage() {
  return (
    <ComingSoon
      title="Course"
      blurb="A guided beginner course built from the training material is planned for a later phase. No curriculum content exists yet, so this section is a placeholder."
      bullets={[
        "Structured modules: electrical basics, pipe jacking method, reading drawings and parts lists",
        "Short checks after each module",
        "Progress tracking per crew member (needs accounts, which v1 does not have)",
      ]}
    />
  );
}
