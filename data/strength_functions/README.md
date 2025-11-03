# Beta-decay Strength Functions (DD-PC1/DD-PCX)

This directory contains **Gamow–Teller (GT)** and **first-forbidden (FF)** charge-exchange strength functions extracted from linear response QRPA calculations on axially-deformed RHB ground states. The data currently exists for only 105 nuclei which were used to cross check the contour integration energy window for odd nuclei.

- **Framework:** RHB + linear response QRPA (interactions: **DD-PC1**, **DD-PCX**)
- **Modes:**
  - **GT**: Gamow-Teller, decomposed into intrinsic **K = 0, 1**
  - **FF**: spin-dipole first-forbidden operators (\(1^{-}\) only), also with **K = 0, 1**
- **Total strength (axial symmetry):**
  \[
  S_{\text{tot}}(E) \;=\; S_{K=0}(E) \;+\; 2\,S_{K=1}(E),
  \]
  reflecting the \(\pm K\) degeneracy.

---

## Directory layout
<NuclideTag>_<OP>K0.txt
<NuclideTag><OP>K1.txt
<NuclideTag><OP>_Total.txt

## File format
- **Column 1:** excitation energy \(E\) in **MeV** with respect to parent nucleus
- **Column 2:** strength function \(S(E)\)
- File meaning:
  - `..._K0.txt`  → \(S_{K=0}(E)\)
  - `..._K1.txt`  → \(S_{K=1}(E)\)
  - `..._Total.txt` → \(S_{K=0}(E) + 2 S_{K=1}(E)\)

## Example figures
Shown for ${}^{233}$W (```_W233``` in text format).
**Gamow–Teller (GT)**
![GT strength example](figs/GT_example.png)

**First-forbidden \(1^- \)(FF)**
![FF strength example](figs/FF_example.png)
