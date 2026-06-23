import type { PaperProject } from "@/lib/types";

export function createDemoProject(): PaperProject {
  const now = new Date().toISOString();

  return {
    id: "demo-project",
    user_id: "demo-user",
    title: "Class 10 Science Question Paper",
    status: "ready",
    language: "en",
    created_at: now,
    updated_at: now,
    pages: [
      {
        id: "demo-page-1",
        pageNumber: 1,
        sourceType: "image",
        sourceUrl:
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='794' height='1123' viewBox='0 0 794 1123'%3E%3Crect width='794' height='1123' fill='%23fffdf7'/%3E%3Crect x='70' y='70' width='654' height='983' fill='none' stroke='%239a9488' stroke-width='3'/%3E%3Ctext x='397' y='135' text-anchor='middle' font-family='Arial' font-size='32' font-weight='700'%3EAnnual Examination%3C/text%3E%3Ctext x='397' y='180' text-anchor='middle' font-family='Arial' font-size='22'%3EClass 10 - Science%3C/text%3E%3Ctext x='95' y='245' font-family='Arial' font-size='20' font-weight='700'%3ESection A%3C/text%3E%3Ctext x='95' y='300' font-family='Arial' font-size='19'%3E1. Choose the correct option. [2]%3C/text%3E%3Ctext x='120' y='345' font-family='Arial' font-size='18'%3E(a) Oxygen (b) Nitrogen (c) Carbon dioxide (d) Hydrogen%3C/text%3E%3Ctext x='95' y='410' font-family='Arial' font-size='19'%3E2. Draw and label the following diagram. [4]%3C/text%3E%3Crect x='180' y='455' width='430' height='230' fill='none' stroke='%232563eb' stroke-dasharray='10 8' stroke-width='3'/%3E%3Ctext x='397' y='575' text-anchor='middle' font-family='Arial' font-size='22' fill='%232563eb'%3EDIAGRAM%3C/text%3E%3Ctext x='95' y='745' font-family='Arial' font-size='20' font-weight='700'%3ESection B%3C/text%3E%3Ctext x='95' y='800' font-family='Arial' font-size='19'%3E3. Answer the following in brief. [3]%3C/text%3E%3Ctext x='95' y='855' font-family='Arial' font-size='19'%3E4. Complete the table. [3]%3C/text%3E%3C/svg%3E",
        ocrText:
          "Annual Examination\nClass 10 - Science\nSection A\n1. Choose the correct option. [2]\n(a) Oxygen (b) Nitrogen (c) Carbon dioxide (d) Hydrogen\n2. Draw and label the following diagram. [4]\n[DIAGRAM HERE]\nSection B\n3. Answer the following in brief. [3]\n4. Complete the table. [3]",
        html: `
          <h1>Annual Examination</h1>
          <p style="text-align:center"><strong>Class 10 - Science</strong></p>
          <p style="text-align:center">Time: 2 Hours | Marks: 40</p>
          <h2>Section A</h2>
          <p><strong>1. Choose the correct option.</strong> <strong style="float:right">[2]</strong></p>
          <ol type="a">
            <li>Oxygen</li>
            <li>Nitrogen</li>
            <li>Carbon dioxide</li>
            <li>Hydrogen</li>
          </ol>
          <p><strong>2. Draw and label the following diagram.</strong> <strong style="float:right">[4]</strong></p>
          <p style="text-align:center;border:1px dashed #777;padding:28px">[DIAGRAM HERE]</p>
          <h2>Section B</h2>
          <p><strong>3. Answer the following in brief.</strong> <strong style="float:right">[3]</strong></p>
          <p>(a) Define photosynthesis.</p>
          <p>(b) State two uses of oxygen.</p>
          <p><strong>4. Complete the table.</strong> <strong style="float:right">[3]</strong></p>
          <table>
            <tbody>
              <tr><th>Substance</th><th>State</th><th>Example</th></tr>
              <tr><td>Solid</td><td>Fixed shape</td><td>Ice</td></tr>
              <tr><td>Liquid</td><td>Fixed volume</td><td>Water</td></tr>
            </tbody>
          </table>
        `,
        diagrams: [
          {
            id: "demo-diagram-1",
            placeholder: "[DIAGRAM HERE]",
            pageNumber: 1
          }
        ]
      }
    ]
  };
}
