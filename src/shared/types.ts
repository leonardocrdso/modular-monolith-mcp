export interface CodeExample {
  label: "Good" | "Bad";
  language: string;
  code: string;
}

export interface CleanCodeReference {
  principleId: string;
  relationship: "reinforces" | "implements" | "extends" | "complements";
  note: string;
}
