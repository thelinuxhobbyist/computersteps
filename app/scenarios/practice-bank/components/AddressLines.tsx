import type { BankAccount } from "../bank-data";

type AddressLinesProps = { account: Pick<BankAccount, "addressLine1" | "townOrCity" | "postcode"> };

export default function AddressLines({ account }: AddressLinesProps) {
  return (
    <span className="pb-address">
      <span>{account.addressLine1}</span>
      <span>{account.townOrCity}</span>
      <span>{account.postcode}</span>
    </span>
  );
}
