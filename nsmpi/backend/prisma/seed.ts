import { PrismaClient, UserRole, Gender, EducationLevel, RiskLevel, PrimaryIssue, TherapyRequestStatus, SessionStatus, Governorate, ConsentType, NotificationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.$transaction([
    prisma.sessionFeedback.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.session.deleteMany(),
    prisma.therapyRequest.deleteMany(),
    prisma.screening.deleteMany(),
    prisma.consent.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.aggregateStats.deleteMany(),
    prisma.studentProfile.deleteMany(),
    prisma.therapistProfile.deleteMany(),
    prisma.adminProfile.deleteMany(),
    prisma.systemSetting.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  console.log('✅ Cleared existing data');

  // Create demo passwords
  const passwordHash = await bcrypt.hash('Demo@123', 10);

  // ==========================================
  // Create Super Admin
  // ==========================================
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@nsmpi.gov',
      password: passwordHash,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
      emailVerified: true,
      adminProfile: {
        create: {
          firstName: 'Ahmad',
          lastName: 'Hassan',
          firstNameAr: 'أحمد',
          lastNameAr: 'حسن',
          phone: '+20 100 000 0001',
          department: 'IT Administration',
          employeeId: 'SA-001',
          permissions: ['all'],
        },
      },
    },
  });

  console.log('✅ Created Super Admin:', superAdmin.email);

  // ==========================================
  // Create Educational Admins
  // ==========================================
  const eduAdmin1 = await prisma.user.create({
    data: {
      email: 'eduadmin@moedu.gov',
      password: passwordHash,
      role: UserRole.EDUCATIONAL_ADMIN,
      isActive: true,
      emailVerified: true,
      adminProfile: {
        create: {
          firstName: 'Fatima',
          lastName: 'Ali',
          firstNameAr: 'فاطمة',
          lastNameAr: 'علي',
          phone: '+20 100 000 0002',
          department: 'Student Welfare',
          employeeId: 'EA-001',
          permissions: ['view_screenings', 'view_aggregates', 'manage_announcements'],
        },
      },
    },
  });

  const eduAdmin2 = await prisma.user.create({
    data: {
      email: 'eduadmin2@moedu.gov',
      password: passwordHash,
      role: UserRole.EDUCATIONAL_ADMIN,
      isActive: true,
      emailVerified: true,
      adminProfile: {
        create: {
          firstName: 'Mohamed',
          lastName: 'Ibrahim',
          firstNameAr: 'محمد',
          lastNameAr: 'إبراهيم',
          phone: '+20 100 000 0003',
          department: 'School Psychology',
          employeeId: 'EA-002',
          permissions: ['view_screenings', 'view_aggregates'],
        },
      },
    },
  });

  console.log('✅ Created Educational Admins');

  // ==========================================
  // Create Health Admins
  // ==========================================
  const healthAdmin1 = await prisma.user.create({
    data: {
      email: 'healthadmin@moh.gov',
      password: passwordHash,
      role: UserRole.HEALTH_ADMIN,
      isActive: true,
      emailVerified: true,
      adminProfile: {
        create: {
          firstName: 'Samar',
          lastName: 'Khalil',
          firstNameAr: 'سمر',
          lastNameAr: 'خليل',
          phone: '+20 100 000 0004',
          department: 'Mental Health',
          employeeId: 'HA-001',
          permissions: ['view_aggregates', 'manage_therapists', 'view_therapy_data'],
        },
      },
    },
  });

  const healthAdmin2 = await prisma.user.create({
    data: {
      email: 'healthadmin2@moh.gov',
      password: passwordHash,
      role: UserRole.HEALTH_ADMIN,
      isActive: true,
      emailVerified: true,
      adminProfile: {
        create: {
          firstName: 'Khaled',
          lastName: 'Mahmoud',
          firstNameAr: 'خالد',
          lastNameAr: 'محمود',
          phone: '+20 100 000 0005',
          department: 'Child Psychiatry',
          employeeId: 'HA-002',
          permissions: ['view_aggregates', 'manage_therapists'],
        },
      },
    },
  });

  console.log('✅ Created Health Admins');

  // ==========================================
  // Create Therapists
  // ==========================================
  const therapists = [
    {
      email: 'therapist1@nsmpi.gov',
      firstName: 'Dr. Nadia',
      lastName: 'Fouad',
      firstNameAr: 'د. نادية',
      lastNameAr: 'فؤاد',
      licenseNumber: 'PSY-2024-001',
      specialization: 'Clinical Psychology',
      yearsExperience: 8,
      governorate: Governorate.CAIRO,
      city: 'Nasr City',
      maxStudents: 25,
      isVerified: true,
    },
    {
      email: 'therapist2@nsmpi.gov',
      firstName: 'Dr. Omar',
      lastName: 'Said',
      firstNameAr: 'د. عمر',
      lastNameAr: 'سعيد',
      licenseNumber: 'PSY-2024-002',
      specialization: 'Cognitive Behavioral Therapy',
      yearsExperience: 12,
      governorate: Governorate.ALEXANDRIA,
      city: 'Miami',
      maxStudents: 20,
      isVerified: true,
    },
    {
      email: 'therapist3@nsmpi.gov',
      firstName: 'Dr. Layla',
      lastName: 'Mostafa',
      firstNameAr: 'د. ليلى',
      lastNameAr: 'مصطفى',
      licenseNumber: 'PSY-2024-003',
      specialization: 'Child Psychology',
      yearsExperience: 6,
      governorate: Governorate.GIZA,
      city: 'Dokki',
      maxStudents: 30,
      isVerified: true,
    },
    {
      email: 'therapist4@nsmpi.gov',
      firstName: 'Dr. Youssef',
      lastName: 'Adel',
      firstNameAr: 'د. يوسف',
      lastNameAr: 'عادل',
      licenseNumber: 'PSY-2024-004',
      specialization: 'Anxiety Disorders',
      yearsExperience: 15,
      governorate: Governorate.CAIRO,
      city: 'Maadi',
      maxStudents: 20,
      isVerified: true,
    },
    {
      email: 'therapist5@nsmpi.gov',
      firstName: 'Dr. Hana',
      lastName: 'Tarek',
      firstNameAr: 'د. هنا',
      lastNameAr: 'طارق',
      licenseNumber: 'PSY-2024-005',
      specialization: 'Depression Treatment',
      yearsExperience: 10,
      governorate: Governorate.ISMAILIA,
      city: 'Ismailia City',
      maxStudents: 25,
      isVerified: true,
    },
    {
      email: 'therapist6@nsmpi.gov',
      firstName: 'Dr. Karim',
      lastName: 'Hassan',
      firstNameAr: 'د. كريم',
      lastNameAr: 'حسن',
      licenseNumber: 'PSY-2024-006',
      specialization: 'Adolescent Mental Health',
      yearsExperience: 7,
      governorate: Governorate.LUXOR,
      city: 'Luxor City',
      maxStudents: 20,
      isVerified: true,
    },
  ];

  const createdTherapists: any[] = [];
  for (const therapist of therapists) {
    const user = await prisma.user.create({
      data: {
        email: therapist.email,
        password: passwordHash,
        role: UserRole.THERAPIST,
        isActive: true,
        emailVerified: true,
        therapistProfile: {
          create: {
            firstName: therapist.firstName,
            lastName: therapist.lastName,
            firstNameAr: therapist.firstNameAr,
            lastNameAr: therapist.lastNameAr,
            licenseNumber: therapist.licenseNumber,
            specialization: therapist.specialization,
            yearsExperience: therapist.yearsExperience,
            qualifications: ['PhD Psychology', 'Licensed Therapist'],
            phone: '+20 100 000 00' + (createdTherapists.length + 10),
            email: therapist.email,
            governorate: therapist.governorate,
            city: therapist.city,
            isOnlineAvailable: true,
            isInPersonAvailable: true,
            workingHours: {
              sunday: [{ start: '09:00', end: '17:00' }],
              monday: [{ start: '09:00', end: '17:00' }],
              tuesday: [{ start: '09:00', end: '17:00' }],
              wednesday: [{ start: '09:00', end: '17:00' }],
              thursday: [{ start: '09:00', end: '14:00' }],
            },
            isVerified: therapist.isVerified,
            verificationDate: new Date(),
            maxStudents: therapist.maxStudents,
            currentStudents: 0,
          },
        },
      },
      include: { therapistProfile: true },
    });
    createdTherapists.push(user);
  }

  console.log('✅ Created', createdTherapists.length, 'Therapists');

  // ==========================================
  // Create Students with Screenings
  // ==========================================
  const governorates = Object.values(Governorate);
  const educationLevels = [EducationLevel.HIGH_SCHOOL, EducationLevel.UNIVERSITY];
  const genders = [Gender.MALE, Gender.FEMALE];

  const firstNames = ['Ahmed', 'Mohamed', 'Ali', 'Omar', 'Youssef', 'Ibrahim', 'Hassan', 'Khaled', 'Mahmoud', 'Tarek', 'Sara', 'Fatima', 'Aya', 'Nour', 'Mariam', 'Yasmin', 'Hana', 'Laila', 'Rana', 'Dina'];
  const firstNamesAr = ['أحمد', 'محمد', 'علي', 'عمر', 'يوسف', 'إبراهيم', 'حسن', 'خالد', 'محمود', 'طارق', 'سارة', 'فاطمة', 'آية', 'نور', 'مريم', 'ياسمين', 'هنا', 'ليلى', 'رنا', 'دينا'];
  const lastNames = ['Hassan', 'Ali', 'Mohamed', 'Ibrahim', 'Mahmoud', 'Ahmed', 'Khalil', 'Fouad', 'Said', 'Mostafa', 'Adel', 'Tarek', 'Khalil', 'Omar', 'Sami'];
  const lastNamesAr = ['حسن', 'علي', 'محمد', 'إبراهيم', 'محمود', 'أحمد', 'خليل', 'فؤاد', 'سعيد', 'مصطفى', 'عادل', 'طارق', 'خليل', 'عمر', 'سامي'];

  const createdStudents: any[] = [];

  for (let i = 0; i < 50; i++) {
    const firstNameIndex = Math.floor(Math.random() * firstNames.length);
    const lastNameIndex = Math.floor(Math.random() * lastNames.length);
    const governorate = governorates[Math.floor(Math.random() * governorates.length)];
    const educationLevel = educationLevels[Math.floor(Math.random() * educationLevels.length)];
    const gender = genders[Math.floor(Math.random() * genders.length)];

    // Generate screening scores
    const phq9Score = Math.floor(Math.random() * 28); // 0-27
    const gad7Score = Math.floor(Math.random() * 22); // 0-21
    const focusScore = Math.floor(Math.random() * 16); // 0-15
    const totalScore = phq9Score + gad7Score + focusScore;

    // Determine risk level
    let riskLevel: RiskLevel;
    if (phq9Score < 5 && gad7Score < 5) {
      riskLevel = RiskLevel.LOW;
    } else if (phq9Score < 10 && gad7Score < 10) {
      riskLevel = RiskLevel.MODERATE;
    } else if (phq9Score < 15 && gad7Score < 15) {
      riskLevel = RiskLevel.HIGH;
    } else {
      riskLevel = RiskLevel.SEVERE;
    }

    // Determine primary issue
    let primaryIssue: PrimaryIssue;
    if (gad7Score > phq9Score && gad7Score > focusScore) {
      primaryIssue = PrimaryIssue.ANXIETY;
    } else if (phq9Score > gad7Score && phq9Score > focusScore) {
      primaryIssue = PrimaryIssue.DEPRESSION;
    } else if (focusScore > phq9Score && focusScore > gad7Score) {
      primaryIssue = PrimaryIssue.FOCUS;
    } else {
      primaryIssue = PrimaryIssue.STRESS;
    }

    const academicImpactScore = Math.random();

    const student = await prisma.user.create({
      data: {
        email: `student${i + 1}@demo.edu`,
        password: passwordHash,
        role: UserRole.STUDENT,
        isActive: true,
        emailVerified: true,
        studentProfile: {
          create: {
            firstName: firstNames[firstNameIndex],
            lastName: lastNames[lastNameIndex],
            firstNameAr: firstNamesAr[firstNameIndex],
            lastNameAr: lastNamesAr[lastNameIndex],
            dateOfBirth: new Date(2000 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
            gender,
            phone: `+20 1${Math.floor(Math.random() * 3)}${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
            educationLevel,
            institutionName: educationLevel === EducationLevel.UNIVERSITY ? 'Cairo University' : 'El-Nasr Boys School',
            gradeYear: educationLevel === EducationLevel.UNIVERSITY ? `Year ${Math.floor(Math.random() * 4) + 1}` : `Grade ${Math.floor(Math.random() * 3) + 10}`,
            studentId: `STU-${2024}-${(i + 1).toString().padStart(4, '0')}`,
            governorate,
            city: governorate.toString().charAt(0) + governorate.toString().slice(1).toLowerCase() + ' City',
            familyIncomeLevel: Math.floor(Math.random() * 5) + 1,
            hasHealthInsurance: Math.random() > 0.7,
            emergencyName: firstNames[Math.floor(Math.random() * firstNames.length)] + ' ' + lastNames[Math.floor(Math.random() * lastNames.length)],
            emergencyPhone: '+20 100 000 0000',
            emergencyRelation: 'Parent',
          },
        },
        screenings: {
          create: {
            phq9Score,
            phq9Answers: { q1: Math.floor(Math.random() * 4), q2: Math.floor(Math.random() * 4), q3: Math.floor(Math.random() * 4), q4: Math.floor(Math.random() * 4), q5: Math.floor(Math.random() * 4), q6: Math.floor(Math.random() * 4), q7: Math.floor(Math.random() * 4), q8: Math.floor(Math.random() * 4), q9: Math.floor(Math.random() * 4) },
            gad7Score,
            gad7Answers: { q1: Math.floor(Math.random() * 4), q2: Math.floor(Math.random() * 4), q3: Math.floor(Math.random() * 4), q4: Math.floor(Math.random() * 4), q5: Math.floor(Math.random() * 4), q6: Math.floor(Math.random() * 4), q7: Math.floor(Math.random() * 4) },
            focusScore,
            focusAnswers: { q1: Math.floor(Math.random() * 4), q2: Math.floor(Math.random() * 4), q3: Math.floor(Math.random() * 4), q4: Math.floor(Math.random() * 4), q5: Math.floor(Math.random() * 4) },
            totalScore,
            riskLevel,
            primaryIssue,
            academicImpactScore,
            resultsExplanation: {
              en: `Your screening shows ${riskLevel.toLowerCase()} risk level with primary concern: ${primaryIssue.toLowerCase()}.`,
              ar: `يُظهر الفحص مستوى خطر ${riskLevel.toLowerCase()} مع القلق الأساسي: ${primaryIssue.toLowerCase()}.`,
            },
            completedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
          },
        },
      },
      include: { screenings: true, studentProfile: true },
    });

    createdStudents.push(student);

    // Create consent records
    await prisma.consent.create({
      data: {
        userId: student.id,
        type: ConsentType.REGISTRATION,
        version: '1.0',
        given: true,
        givenAt: new Date(),
        ipAddress: '127.0.0.1',
      },
    });

    await prisma.consent.create({
      data: {
        userId: student.id,
        type: ConsentType.SCREENING,
        version: '1.0',
        given: true,
        givenAt: new Date(),
        ipAddress: '127.0.0.1',
      },
    });
  }

  console.log('✅ Created', createdStudents.length, 'Students with Screenings');

  // ==========================================
  // Create Therapy Requests and Sessions
  // ==========================================
  let therapyRequestCount = 0;
  let sessionCount = 0;

  for (const student of createdStudents) {
    const screening = student.screenings[0];
    
    // Only create therapy requests for moderate+ risk
    if (screening.riskLevel !== RiskLevel.LOW) {
      // Calculate subsidy
      let subsidyPercentage = 0;
      if (screening.riskLevel === RiskLevel.SEVERE) subsidyPercentage = 90;
      else if (screening.riskLevel === RiskLevel.HIGH) subsidyPercentage = 70;
      else if (screening.riskLevel === RiskLevel.MODERATE) subsidyPercentage = 50;

      if (student.studentProfile.familyIncomeLevel <= 2) subsidyPercentage += 10;
      if (subsidyPercentage > 90) subsidyPercentage = 90;

      const maxSessions = screening.riskLevel === RiskLevel.SEVERE ? 20 : screening.riskLevel === RiskLevel.HIGH ? 15 : 10;

      const therapist = createdTherapists[Math.floor(Math.random() * createdTherapists.length)];

      const therapyRequest = await prisma.therapyRequest.create({
        data: {
          userId: student.id,
          screeningId: screening.id,
          status: TherapyRequestStatus.APPROVED,
          requestedAt: new Date(Date.now() - Math.floor(Math.random() * 20) * 24 * 60 * 60 * 1000),
          reviewedAt: new Date(),
          reviewedBy: healthAdmin1.id,
          subsidyPercentage,
          subsidyCalculation: {
            baseSubsidy: screening.riskLevel === RiskLevel.SEVERE ? 80 : screening.riskLevel === RiskLevel.HIGH ? 60 : 40,
            incomeBonus: student.studentProfile.familyIncomeLevel <= 2 ? 10 : 0,
            finalPercentage: subsidyPercentage,
          },
          maxSessionsCovered: maxSessions,
          approvedBy: healthAdmin1.id,
          approvalNotes: 'Approved based on screening results and socioeconomic factors.',
          assignedTherapistId: therapist.therapistProfile!.id,
        },
      });

      therapyRequestCount++;

      // Create sessions for approved requests
      const numSessions = Math.floor(Math.random() * 5) + 1;
      for (let s = 0; s < numSessions; s++) {
        const sessionDate = new Date(Date.now() - (numSessions - s - 1) * 7 * 24 * 60 * 60 * 1000);
        const isCompleted = s < numSessions - 1 || Math.random() > 0.3;
        const isCancelled = !isCompleted && Math.random() > 0.5;

        const session = await prisma.session.create({
          data: {
            therapyRequestId: therapyRequest.id,
            studentId: student.id,
            therapistId: therapist.therapistProfile!.id,
            scheduledAt: sessionDate,
            duration: 60,
            sessionType: Math.random() > 0.5 ? 'ONLINE' : 'INDIVIDUAL',
            status: isCompleted ? SessionStatus.COMPLETED : isCancelled ? SessionStatus.CANCELLED : SessionStatus.SCHEDULED,
            isOnline: Math.random() > 0.5,
            meetingLink: Math.random() > 0.5 ? 'https://meet.nsmpi.gov/session-' + s : null,
            notes: isCompleted ? 'Session completed. Student showing improvement in coping strategies.' : null,
            attendedAt: isCompleted ? sessionDate : null,
            completedAt: isCompleted ? new Date(sessionDate.getTime() + 60 * 60 * 1000) : null,
            progressRating: isCompleted ? Math.floor(Math.random() * 5) + 6 : null,
            moodBefore: isCompleted ? Math.floor(Math.random() * 3) + 4 : null,
            moodAfter: isCompleted ? Math.floor(Math.random() * 3) + 6 : null,
          },
        });

        sessionCount++;

        // Create feedback for completed sessions
        if (isCompleted && Math.random() > 0.3) {
          await prisma.sessionFeedback.create({
            data: {
              sessionId: session.id,
              studentId: student.id,
              rating: Math.floor(Math.random() * 2) + 4,
              wasHelpful: true,
              comments: 'Very helpful session. The therapist was understanding and provided useful techniques.',
              wouldRecommend: true,
              isAnonymous: Math.random() > 0.8,
            },
          });
        }
      }

      // Update therapist current students count
      await prisma.therapistProfile.update({
        where: { id: therapist.therapistProfile!.id },
        data: { currentStudents: { increment: 1 } },
      });
    }
  }

  console.log('✅ Created', therapyRequestCount, 'Therapy Requests');
  console.log('✅ Created', sessionCount, 'Sessions');

  // ==========================================
  // Create Notifications
  // ==========================================
  for (const student of createdStudents.slice(0, 20)) {
    await prisma.notification.create({
      data: {
        userId: student.id,
        type: NotificationType.SCREENING_COMPLETE,
        title: 'Screening Completed',
        titleAr: 'اكتمل الفحص',
        message: 'Your mental health screening has been completed. View your results in the dashboard.',
        messageAr: 'تم إكمال فحص الصحة النفسية الخاص بك. اعرض النتائج في لوحة التحكم.',
        isRead: Math.random() > 0.5,
      },
    });
  }

  console.log('✅ Created Notifications');

  // ==========================================
  // Create Aggregate Stats
  // ==========================================
  const now = new Date();
  for (let m = 0; m < 6; m++) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - m + 1, 0);

    for (const gov of governorates.slice(0, 5)) {
      for (const edu of educationLevels) {
        await prisma.aggregateStats.create({
          data: {
            periodStart: monthStart,
            periodEnd: monthEnd,
            periodType: 'MONTHLY',
            governorate: gov,
            educationLevel: edu,
            totalScreenings: Math.floor(Math.random() * 100) + 50,
            avgPhq9Score: 8 + Math.random() * 8,
            avgGad7Score: 6 + Math.random() * 6,
            avgFocusScore: 5 + Math.random() * 5,
            avgAcademicImpact: 0.4 + Math.random() * 0.4,
            lowRiskCount: Math.floor(Math.random() * 30) + 10,
            moderateRiskCount: Math.floor(Math.random() * 25) + 10,
            highRiskCount: Math.floor(Math.random() * 20) + 5,
            severeRiskCount: Math.floor(Math.random() * 10) + 2,
            anxietyCount: Math.floor(Math.random() * 30) + 10,
            depressionCount: Math.floor(Math.random() * 30) + 10,
            focusCount: Math.floor(Math.random() * 20) + 5,
            stressCount: Math.floor(Math.random() * 20) + 5,
            otherCount: Math.floor(Math.random() * 10) + 2,
            totalTherapyRequests: Math.floor(Math.random() * 50) + 20,
            approvedRequests: Math.floor(Math.random() * 40) + 15,
            totalSessions: Math.floor(Math.random() * 100) + 50,
            completedSessions: Math.floor(Math.random() * 80) + 40,
            improvementRate: 0.6 + Math.random() * 0.3,
            therapistUtilization: 0.5 + Math.random() * 0.4,
            estimatedCostSavings: Math.floor(Math.random() * 500000) + 100000,
          },
        });
      }
    }
  }

  console.log('✅ Created Aggregate Stats');

  // ==========================================
  // Create System Settings
  // ==========================================
  await prisma.systemSetting.createMany({
    data: [
      {
        key: 'screening_enabled',
        value: true,
        description: 'Enable/disable screening module',
      },
      {
        key: 'therapy_booking_enabled',
        value: true,
        description: 'Enable/disable therapy booking module',
      },
      {
        key: 'national_dashboard_enabled',
        value: true,
        description: 'Enable/disable national dashboard',
      },
      {
        key: 'subsidy_engine_enabled',
        value: true,
        description: 'Enable/disable subsidy allocation engine',
      },
      {
        key: 'maintenance_mode',
        value: false,
        description: 'Put system in maintenance mode',
      },
      {
        key: 'phq9_thresholds',
        value: { low: 5, moderate: 10, high: 15, severe: 20 },
        description: 'PHQ-9 score thresholds for risk classification',
      },
      {
        key: 'gad7_thresholds',
        value: { low: 5, moderate: 10, high: 15 },
        description: 'GAD-7 score thresholds for risk classification',
      },
    ],
  });

  console.log('✅ Created System Settings');

  // ==========================================
  // Print Demo Credentials
  // ==========================================
  console.log('\n' + '='.repeat(60));
  console.log('🎉 DATABASE SEED COMPLETED SUCCESSFULLY!');
  console.log('='.repeat(60));
  console.log('\n📋 DEMO CREDENTIALS:');
  console.log('-'.repeat(40));
  console.log('Super Admin:     superadmin@nsmpi.gov / Demo@123');
  console.log('Edu Admin:       eduadmin@moedu.gov / Demo@123');
  console.log('Health Admin:    healthadmin@moh.gov / Demo@123');
  console.log('Therapist:       therapist1@nsmpi.gov / Demo@123');
  console.log('Student:         student1@demo.edu / Demo@123');
  console.log('-'.repeat(40));
  console.log(`\n📊 Summary:`);
  console.log(`   • ${createdStudents.length} Students`);
  console.log(`   • ${createdTherapists.length} Therapists`);
  console.log(`   • ${therapyRequestCount} Therapy Requests`);
  console.log(`   • ${sessionCount} Sessions`);
  console.log('='.repeat(60) + '\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
