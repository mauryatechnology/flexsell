export interface Customer {
  _id: string;
  name: string;
  email: string;
  company?: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  phone: string;
  initials: string;
  gstin?: string;
}

export const customers: Customer[] = [
  {
    _id: "60c72b2f9b1d8e001c8e2001",
    name: "John Doe",
    email: "john@doeent.com",
    company: "Doe Ent.",
    address: "45 Textile Market, Ring Road",
    city: "Surat",
    state: "Gujarat",
    pinCode: "395002",
    phone: "+91 98765 43210",
    initials: "JD",
    gstin: "24AAACD4521D1Z1"
  },
  {
    _id: "60c72b2f9b1d8e001c8e2002",
    name: "Jane Smith",
    email: "jane@smithretail.in",
    company: "Smith Retail Group",
    address: "GIDC Electronic Zone, Sector 26",
    city: "Gandhinagar",
    state: "Gujarat",
    pinCode: "382010",
    phone: "+91 88877 66655",
    initials: "JS",
    gstin: "24AAACS9823S2Z5"
  },
  {
    _id: "60c72b2f9b1d8e001c8e2003",
    name: "Amit Patel",
    email: "amit@pateldistributors.com",
    company: "Patel Distributors",
    address: "Industrial Area Phase 2",
    city: "Ahmedabad",
    state: "Gujarat",
    pinCode: "380001",
    phone: "+91 99988 77766",
    initials: "AP",
    gstin: "24AAACP4512P1ZA"
  }
];

// Active Customer logged in session
export const activeCustomer = customers[0];
