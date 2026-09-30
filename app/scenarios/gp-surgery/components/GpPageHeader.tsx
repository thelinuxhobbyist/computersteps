import Link from "next/link";
import type { ReactNode } from "react";
import { GP_BASE } from "../surgery-data";

export default function GpPageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="gp-page-head">
      <div className="gp-wrap">
        <nav className="gp-breadcrumb" aria-label="Breadcrumb">
          <Link href={`${GP_BASE}/`}>Home</Link>
          <span aria-hidden="true">›</span>
          <span aria-current="page">{title}</span>
        </nav>
        <h1>{title}</h1>
        {children ? <div className="gp-page-head__lead">{children}</div> : null}
      </div>
    </div>
  );
}
