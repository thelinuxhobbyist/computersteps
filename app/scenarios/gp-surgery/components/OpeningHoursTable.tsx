import { OPENING_HOURS } from "../surgery-data";

export default function OpeningHoursTable({ caption = "Surgery opening hours" }: { caption?: string }) {
  return (
    <table className="gp-hours">
      <caption>{caption}</caption>
      <tbody>
        {OPENING_HOURS.map((row) => (
          <tr key={row.day} className={row.hours === "Closed" ? "is-closed" : undefined}>
            <th scope="row">{row.day}</th>
            <td>{row.hours}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
