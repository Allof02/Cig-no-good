# Cig-No-Good  
**CSC316 Project**  
_Group Members:_  
- **Pete Chen** (Team Coordinator)  
  - **GitHub:** [allof02](https://github.com/allof02)  
  - **Email:** [petepete.chen@mail.utoronto.ca](mailto:petepete.chen@mail.utoronto.ca)  

- **Xiyuan Jin**  
  - GitHub: TO BE ADDED  
  - Email: xiyuan.jin@mail.utoronto.ca  

---

## Project URLs
- **Website:** [https://github.com/Allof02/Cig-no-good](https://github.com/Allof02/Cig-no-good)
- **Screencast Video:** [https://drive.google.com/drive/folders/1jn8MyRf65LjucFrE1fvi2Zxlvl-7cXZP?usp=sharing]

---

## 📌 **Project Overview**  
**Cig-No-Good** is an interactive data visualization project focused on revealing the devastating impact of smoking on global health. Through carefully curated data, the project explores how smoking-related diseases, death rates, and economic costs are influenced by factors like tobacco taxes and advertising bans. The goal is to create an engaging and informative platform that helps users understand why smoking is harmful — and why quitting matters.  

---

## 📂 **Repository Structure & Code Attribution**

- **`js/`** - JavaScript files for visualizations
  - `smoke_disease_barVis.js` - Bar chart visualization for smoking-related diseases
  - `lungCancerDeathRate.js` - Visualization for lung cancer death rates
  - `lungLineVis.js` - Line chart for lung cancer data
  - `banLineVis.js` - Line chart for tobacco advertising ban data
  - `globeVis.js` - Interactive globe visualization
  - `ukBrush.js` - Brushing functionality for UK data
  - `ukDeathChart.js` - Death rate visualization for UK
  - `ukTaxChart.js` - Tax rate visualization
  - `smokeSpendingVis.js` - Visualization for tobacco spending
  - `yearDeathRateBarVis.js` - Bar chart for yearly death rates
  - `yearDeathRatePieChart.js` - Pie chart for death rate composition
  - `main.js` - Main JavaScript file that controls the application flow

- **`css/`** - Custom styling
  - `styles.css` - Custom CSS styles for the project

- **`data/`** - Data files used in visualizations (processed by our team)
- **`images/`** - Image files used

### Third-Party Libraries
- **D3.js** - Used for creating all data visualizations
- **Bootstrap** - Used for responsive layout and basic styling
- **Topojson** - Used for globe visualization data handling

---

## 🎯 **Project Goals**  
✅ Show the correlation between tobacco policies (taxes, advertising bans) and smoking-related health outcomes.  
✅ Educate the public about the health risks and economic burden of smoking.  
✅ Encourage thoughtful decision-making through interactive and insightful visualizations.  

---

## 🌍 **Key Components**  
### 🔹 **Home Page:**  
- Eye-catching title and introduction to engage the audience immediately.  
- Overview of smoking's impact on health and society.  

### 🔹 **Why Care?**  
- A breakdown of how smoking affects the body.  
- Visuals highlighting the most affected organs and cancer cases.  

### 🔹 **Smoking-Related Diseases:**  
- Data on diseases caused by smoking, including lung cancer, heart disease, and more.  
- Comparative analysis of smoking-related admissions versus total admissions.  

### 🔹 **Death Trend:**  
- Long-term trends in smoking-related deaths.  
- Focus on lung cancer mortality rates over time.  

### 🔹 **Anti-Tobacco Policies:**  
- Analysis of how tobacco taxes and advertising bans have influenced smoking rates.  
- Country-wise comparisons of policy effectiveness.  

### 🔹 **Policy Impact:**  
- Data showing how stricter policies have reduced smoking-related deaths.  
- Economic and health benefits of higher tobacco taxes and advertising bans.  

### 🔹 **Conclusion:**  
- Summary of key findings.  
- A call to action: why quitting smoking matters.  

---

## 📊 **Technology Stack**  
| Tool/Technology | Purpose |
|-----------------|---------|
| **JavaScript**   | Core development |
| **D3.js**        | Data visualization |
| **HTML/CSS**     | Frontend structure and styling |
| **Python**       | Data processing and cleanup |
| **Tableau**      | Data exploration and insight generation |
| **Bootstrap**    | Styling and responsive design |

---

## ⚙️ **Non-Obvious Interface Features**

1. **Brushing Tool in Policy Impact Section**
   - The time range filter in the "Policy Impact" section allows you to focus on specific time periods
   - Drag the handles on the brush control to adjust the time range displayed in the charts above
   - This tool helps you explore relationships between tax rates and health outcomes during specific periods

2. **Globe Interaction**
   - The globe visualizations are fully interactive - you can drag to rotate and explore different regions
   - Click on any highlighted country to see its specific data in the charts
   - Countries with available data are shown in blue, while selected countries are highlighted in yellow

3. **Disease Information Panel**
   - In the "Smoking-related disease" section, clicking on any disease bar will display detailed information about that disease in the right panel
   - This feature provides educational content about how smoking affects different parts of the body

4. **Year Toggle**
   - Some visualizations have year toggle buttons that allow you to switch between different years of data
   - Look for these controls to compare changes over time
