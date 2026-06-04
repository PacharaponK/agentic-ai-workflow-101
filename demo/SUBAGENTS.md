# รายละเอียดหน้าที่ของ Subagents ในโปรเจกต์นี้

โปรเจกต์นี้เป็นระบบวิเคราะห์ข้อมูลบริษัทและการลงทุนอัตโนมัติ โดยแบ่งการทำงานออกเป็น **Orchestrator** (ผู้ประสานงานหลัก) และ **Subagents** เฉพาะทาง 3 ตัวที่ทำงานขนานกัน (In Parallel) เพื่อร่วมกันวิเคราะห์และสร้างรายงานการวิเคราะห์การลงทุน (Investment Research Report) ที่สมบูรณ์

---

## 1. Economic Research Orchestrator (`orchestrator`)
* **บทบาทหลัก**: ผู้ประสานงานและรวมรวบข้อมูลหลัก
* **หน้าที่และขั้นตอนการทำงาน**:
  1. **แยกส่วนงาน (Decompose)**: เมื่อได้รับชื่อบริษัทหรือสัญลักษณ์หุ้น (Ticker) จากผู้ใช้ จะแบ่งงานวิเคราะห์ออกเป็น 3 ด้านหลัก ได้แก่ ข้อมูลราคาหุ้นและแนวโน้มตลาด, ข้อมูลอุตสาหกรรมและการแข่งขัน, และข้อมูลพื้นฐานทางการเงิน
  2. **สั่งการขนานกัน (Spawn)**: เรียกใช้งาน Subagents ทั้ง 3 ตัวพร้อมกันแบบขนานกัน (Parallel) ได้แก่ `stock-analyst`, `industry-analyst`, และ `financial-analyst` ผ่านการใช้ `invoke_subagent`
  3. **รอผลลัพธ์ (Wait)**: รอจนกระทั่ง Subagents ทั้งหมดส่งผลการวิเคราะห์กลับมาครบถ้วน
  4. **สังเคราะห์รายงาน (Synthesize)**: นำข้อมูลการวิเคราะห์ทั้งหมดมารวมกันและเรียบเรียงเป็น **Investment Research Report** ที่มีหัวข้อดังนี้:
     * ข้อมูลสรุปของบริษัท (Company Snapshot)
     * การวิเคราะห์ผลการดำเนินงานของหุ้น (Stock Performance Analysis)
     * การวิเคราะห์อุตสาหกรรมและการแข่งขัน (Industry & Competitive Analysis)
     * การวิเคราะห์สุขภาพทางการเงิน (Financial Health Analysis)
     * บทวิเคราะห์จุดเด่น/จุดด้อย (SWOT Summary)
     * มุมมองการลงทุน (Investment Outlook - Bull / Bear / Neutral)
* **เครื่องมือที่ใช้**: `invoke_subagent`, `send_message`
* **ไฟล์การตั้งค่า**: [.agents/agents/orchestrator/agent.json](file:///D:/CoE%20Y.4%20T.1/PUPA/agentic-ai-workflow-101/demo/.agents/agents/orchestrator/agent.json)

---

## 2. Stock Analyst (`stock-analyst`)
* **บทบาทหลัก**: นักวิเคราะห์แนวโน้มราคาหุ้นและความเคลื่อนไหวของตลาด (Equity Price & Market Sentiment Analyst)
* **หน้าที่และขั้นตอนการทำงาน**:
  1. ค้นหาราคาหุ้นล่าสุดและตรวจสอบผลประกอบการของราคาย้อนหลังในระยะเวลาต่างๆ (1 สัปดาห์, 1 เดือน, 3 เดือน, YTD, 1 ปี)
  2. ค้นหาคำแนะนำในการลงทุน (Consensus Recommendations เช่น Buy/Hold/Sell) และราคาเป้าหมาย (Price Targets) จากนักวิเคราะห์ในตลาด
  3. ตรวจสอบกระแสความรู้สึกของตลาด (Market Sentiment) ผ่านข่าวยอดนิยม, การซื้อขายของสถาบัน และปริมาณการ Short หุ้น (Short Interest)
  4. ระดับเทคนิคัลและราคาที่สำคัญ เช่น ราคาสูงสุด-ต่ำสุดในรอบ 52 สัปดาห์ (52-week high/low), แนวรับ-แนวต้าน และเส้นค่าเฉลี่ยเคลื่อนที่ (Moving Averages)
  5. สรุปผลการวิเคราะห์ภายใต้หัวข้อ `## Stock Analysis`
* **เครื่องมือที่ใช้**: `search_web`, `read_url_content`
* **ไฟล์การตั้งค่า**: [.agents/agents/stock-analyst/agent.json](file:///D:/CoE%20Y.4%20T.1/PUPA/agentic-ai-workflow-101/demo/.agents/agents/stock-analyst/agent.json)

---

## 3. Industry Analyst (`industry-analyst`)
* **บทบาทหลัก**: นักวิเคราะห์สภาพแวดล้อมทางอุตสาหกรรมและการแข่งขัน (Sector Dynamics & Competitive Landscape Analyst)
* **หน้าที่และขั้นตอนการทำงาน**:
  1. ระบุประเภทอุตสาหกรรม/เซกเตอร์ของบริษัท พร้อมประเมินระยะการเติบโต (เช่น กำลังเริ่มต้น, กำลังเติบโต, อิ่มตัว หรือกำลังถดถอย)
  2. จัดทำแผนภาพและตารางการแข่งขัน โดยระบุคู่แข่งสำคัญ 3-5 ราย, ส่วนแบ่งการตลาดโดยประมาณ และจุดเด่น/ข้อแตกต่างที่สำคัญของบริษัท
  3. วิเคราะห์ปัจจัยขับเคลื่อนระดับมหภาค ทั้งในส่วนที่เป็นแรงส่ง (Tailwinds) และอุปสรรค (Headwinds) เช่น กฎระเบียบข้อบังคับ, การเปลี่ยนแปลงทางเทคโนโลยี หรือพฤติกรรมผู้บริโภค
  4. ประเมินความได้เปรียบในการแข่งขันที่ยั่งยืน (Competitive Moats) เช่น สิทธิบัตร (IP), ความแข็งแกร่งของแบรนด์, Network Effects, Switching Costs หรือข้อได้เปรียบทางด้านต้นทุน
  5. ติดตามข่าวสารการควบรวมกิจการ (M&A) และแนวโน้มการถูกทำลายล้างตลาดแบบเดิม (Disruption)
  6. สรุปผลการวิเคราะห์ภายใต้หัวข้อ `## Industry Analysis`
* **เครื่องมือที่ใช้**: `search_web`, `read_url_content`
* **ไฟล์การตั้งค่า**: [.agents/agents/industry-analyst/agent.json](file:///D:/CoE%20Y.4%20T.1/PUPA/agentic-ai-workflow-101/demo/.agents/agents/industry-analyst/agent.json)

---

## 4. Financial Analyst (`financial-analyst`)
* **บทบาทหลัก**: นักวิเคราะห์ข้อมูลพื้นฐานทางการเงินและงบการเงิน (Fundamental & Financial Statement Analyst)
* **หน้าที่และขั้นตอนการทำงาน**:
  1. ค้นหาผลประกอบการทางการเงินรายปีและรายไตรมาสล่าสุด เช่น รายได้ (Revenue), กำไรขั้นต้น (Gross Profit), กำไรจากการดำเนินงาน (Operating Income), กำไรสุทธิ (Net Income) และกำไรต่อหุ้น (EPS)
  2. วิเคราะห์โครงสร้างงบดุล (Balance Sheet) ได้แก่ สินทรัพย์รวม (Total Assets), หนี้สินรวม (Total Debt), เงินสดและรายการเทียบเท่า (Cash & Equivalents) และส่วนของผู้ถือหุ้น (Shareholders' Equity)
  3. ตรวจสอบงบกระแสเงินสด (Cash Flow) โดยเน้นไปที่กระแสเงินสดจากการดำเนินงาน (Operating Cash Flow), กระแสเงินสดอิสระ (Free Cash Flow) และค่าใช้จ่ายในการลงทุน (CapEx)
  4. คำนวณหรือหาอัตราส่วนทางการเงินที่สำคัญ เช่น P/E Ratio, P/S Ratio, EV/EBITDA, อัตรากำไรขั้นต้น (Gross Margin), อัตรากำไรสุทธิ (Net Margin), ROE, ROA และอัตราส่วนหนี้สินต่อทุน (Debt-to-Equity)
  5. ตรวจสอบประวัติผลประกอบการในอดีต (4-8 ไตรมาสย้อนหลัง) เทียบกับการคาดการณ์ของนักวิเคราะห์ (Beat/Miss vs Estimates) และทิศทางแนวโน้ม
  6. ประเมินสถานะสุขภาพทางการเงินโดยรวมออกมาเป็นคะแนนระดับ Strong, Moderate หรือ Weak
  7. สรุปผลการวิเคราะห์ภายใต้หัวข้อ `## Financial Analysis`
* **เครื่องมือที่ใช้**: `search_web`, `read_url_content`
* **ไฟล์การตั้งค่า**: [.agents/agents/financial-analyst/agent.json](file:///D:/CoE%20Y.4%20T.1/PUPA/agentic-ai-workflow-101/demo/.agents/agents/financial-analyst/agent.json)
