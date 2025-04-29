import { ManageRedirect } from "@/components/manage/manage-redirect";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage",
};

export default function Manage() {
  return <ManageRedirect />;
}
