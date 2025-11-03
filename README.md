# beta_decay_RSN_2025
Repository for data and figures supporting **Large-scale calculations of β-decay rates and implications for r-process nucleosynthesis**  
*(Ravlić, Saito, and Nazarewicz — in preparation, 2025).*

# Overview

This repository aggregates:
1. **β-decay datasets** computed with axially deformed **RHB + pnQRPA** using the **DD-PC1** and **DD-PCX** interactions.
2. **r-process simulation outputs** used to assess astrophysical impact.


---

## Data formats

### Beta-decay tables (`data/beta_decay`)

Files:
- `data_DDPC1.txt`
- `data_DDPCX.txt`

Each file begins with a commented header (lines starting with `#`) that **defines the columns and units**. Basic description of columns:

| Column      | Meaning                                                                                 | Units / Notes                                  |
|-------------|------------------------------------------------------------------------------------------|-----------------------------------------------|
| `N`         | Neutron number                                                                           | integer                                        |
| `Z`         | Proton number                                                                            | integer                                        |
| `E(beta)`   | Binding energy for the **minimum-energy**                                                | MeV                                            |
| `beta2`     | Mass quadrupole deformation parameter $\beta_2$ at minimum-energy                        | dimensionless                                  |
| `Q`         | $\beta^-$ Q-value computed as `0.782 + B(Z,N) − B(Z+1,N−1)`                                     | MeV                                            |
| `HL_log10`  | `log10(T_half / s)` for the **total** half-life                                         | base-10 logarithm of seconds                   |
| `FF_percent`| Percent contribution of **first-forbidden (FF)** transitions to the **total decay rate** | %            |

> Note: Strength function distribution is only given for a subset of 100 nuclei calculated with DD-PCX interaction as a test of contour for integration for odd-A and odd-odd nuclei. Strength functions for specific nuclei can be obtained by contacting the authors.  
---

### r-process outputs (`data/r-process`)

This directory contains simulation products (e.g., abundances, yields, trajectory diagnostics) used in the manuscript.  
Each subfolder may include its own minimal README describing run settings (network, trajectory set, thermodynamic history, etc.).





https://github.com/user-attachments/assets/7d44070e-04e6-4afd-bd33-09dc9ee76730



### Strength functions for a sample of nuclei (`data/strength_functions`)

This directory contains **Gamow–Teller (GT)** and **first-forbidden (FF)** charge-exchange strength functions extracted from linear response QRPA calculations on axially-deformed RHB ground states. The data currently exists for only 105 nuclei which were used to cross check the contour integration energy window for odd nuclei.

- **Framework:** RHB + linear response QRPA (interactions: **DD-PC1**, **DD-PCX**)
- **Modes:**
  - **GT**: Gamow-Teller, decomposed into intrinsic **K = 0, 1**
  - **FF**: spin-dipole first-forbidden operators ($1^{-}$ only), also with **K = 0, 1**
- **Total strength (axial symmetry):**
  $S_{\text{tot}}(E) \;=\; S_{K=0}(E) \;+\; 2\,S_{K=1}(E)$,
  reflecting the $\pm K$ degeneracy.

---

## File format
- **Column 1:** excitation energy $E$ in **MeV** with respect to parent nucleus
- **Column 2:** strength function $S(E)$
- File meaning:
  - `..._K0.txt`  → $S_{K=0}(E)$
  - `..._K1.txt`  → $S_{K=1}(E)$
  - `..._Total.txt` → $S_{K=0}(E) + 2 S_{K=1}(E)$

## Example figures
Shown for $^{233}$W (```_W233``` in text format).
**Gamow–Teller (GT)**
![GT strength example](data/strength_functions/GT_example.png)

**First-forbidden $1^-$(FF)**
![FF strength example](data/strength_functions/FF_example.png)

---
## Contact

**Ante Ravlić**  
Michigan State University / FRIB / University of Zagreb  
Email: [aravlic@phy.hr](mailto:aravlic@phy.hr)

**Yukiya Saito**  
Michigan State University / FRIB / University of Tennessee / University of Notre Dame
Email: [saitoy@frib.msu.edu](mailto:saitoy@frib.msu.edu)
