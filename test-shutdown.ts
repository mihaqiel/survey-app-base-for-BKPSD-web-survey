import { prisma } from "./lib/prisma";

async function verifyShutdown() {
  console.log("🚀 STARTING SURGICAL SHUTDOWN TEST...");

  // 1. Create a survey with a 1-minute deadline
  const startTime = new Date();
  const expiryTime = new Date(startTime.getTime() + 1 * 60000); // +1 minute [cite: 2026-02-21]

  const testSurvey = await prisma.survey.create({
    data: {
      title: "1-MINUTE TEST NODE",
      isActive: true, // Master Switch ON
      expiresAt: expiryTime,
      questions: {
        create: [{ text: "Is the timer working?", type: "SCORE" }]
      }
    }
  });

  console.log(`✅ Survey Created at: ${startTime.toLocaleTimeString()}`);
  console.log(`⏳ Deadline Set to: ${expiryTime.toLocaleTimeString()}`);

  // 2. Immediate Check (Should be ACTIVE)
  const immediateCheck = await prisma.survey.findUnique({
    where: { 
      id: testSurvey.id,
      isActive: true,
      expiresAt: { gt: new Date() } // The "Auto-Pilot" check
    }
  });
  console.log(`🔍 Immediate Access Check: ${immediateCheck ? "SUCCESS (ACTIVE)" : "FAILED"}`);

  // 3. Wait for 61 seconds
  console.log("...Waiting 61 seconds for auto-shutdown...");
  await new Promise(resolve => setTimeout(resolve, 61000));

  // 4. Post-Deadline Check (Should be CLOSED/NULL) [cite: 2026-02-21]
  const finalCheck = await prisma.survey.findUnique({
    where: { 
      id: testSurvey.id,
      isActive: true,
      expiresAt: { gt: new Date() } 
    }
  });

  if (!finalCheck) {
    console.log("🎯 TEST PASSED: Survey is now Surgically Closed.");
  } else {
    console.log("❌ TEST FAILED: Survey is still accessible after deadline.");
  }
  
  // Clean up
  await prisma.survey.delete({ where: { id: testSurvey.id } });
}

verifyShutdown();