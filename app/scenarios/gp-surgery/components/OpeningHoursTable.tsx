import { OPENING_HOURS, type OpeningHoursRow } from "../surgery-data";

type OpeningHoursTableProps = { caption?: string; rows?: OpeningHoursRow[] };

export default function OpeningHoursTable({ caption = "Surgery opening hours", rows = OPENING_HOURS }: OpeningHoursTableProps) {
  return (
    <table className="gp-hours">
      <caption>{caption}</caption>
      <tbody>
        {rows.map((row) => (
          <tr key={row.day} className={row.hours === "Closed" ? "is-closed" : undefined}>
            <th scope="row">{row.day}</th>
            <td>{row.hours}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
