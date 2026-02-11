-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "UserResource" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "coin" INTEGER NOT NULL DEFAULT 0,
    "marshmallowGuardLow" INTEGER NOT NULL DEFAULT 0,
    "marshmallowGuardMid" INTEGER NOT NULL DEFAULT 0,
    "marshmallowGuardHigh" INTEGER NOT NULL DEFAULT 0,
    "marshmallowAttackLow" INTEGER NOT NULL DEFAULT 0,
    "marshmallowAttackMid" INTEGER NOT NULL DEFAULT 0,
    "marshmallowAttackHigh" INTEGER NOT NULL DEFAULT 0,
    "marshmallowSupportLow" INTEGER NOT NULL DEFAULT 0,
    "marshmallowSupportMid" INTEGER NOT NULL DEFAULT 0,
    "marshmallowSupportHigh" INTEGER NOT NULL DEFAULT 0,
    "purpleCrayon" INTEGER NOT NULL DEFAULT 0,
    "goldCrayon" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoardTemplate" (
    "id" TEXT NOT NULL,
    "raceType" TEXT NOT NULL,
    "race" TEXT NOT NULL,
    "boardType" TEXT NOT NULL,
    "goldNodes" JSONB NOT NULL,
    "purpleNodes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BoardTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "personality" TEXT NOT NULL,
    "race" TEXT NOT NULL,
    "raceType" TEXT NOT NULL,
    "boardTemplateId" TEXT NOT NULL,
    "baseHp" INTEGER,
    "basePhysAtk" INTEGER,
    "baseMagicAtk" INTEGER,
    "basePhysDef" INTEGER,
    "baseMagicDef" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanCharacter" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "currentLevel" INTEGER NOT NULL DEFAULT 1,
    "targetLevel" INTEGER NOT NULL,
    "currentEquipRank" INTEGER NOT NULL DEFAULT 1,
    "targetEquipRank" INTEGER NOT NULL,
    "currentSkillLevel" INTEGER NOT NULL DEFAULT 1,
    "targetSkillLevel" INTEGER NOT NULL,
    "currentStar" INTEGER NOT NULL,
    "targetStar" INTEGER NOT NULL,
    "currentGoldProgress" JSONB NOT NULL,
    "targetGoldProgress" JSONB NOT NULL,
    "currentPurpleProgress" JSONB,
    "targetPurpleProgress" JSONB,

    CONSTRAINT "PlanCharacter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "UserResource_userId_key" ON "UserResource"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BoardTemplate_raceType_key" ON "BoardTemplate"("raceType");

-- CreateIndex
CREATE UNIQUE INDEX "Character_gameId_key" ON "Character"("gameId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserResource" ADD CONSTRAINT "UserResource_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_boardTemplateId_fkey" FOREIGN KEY ("boardTemplateId") REFERENCES "BoardTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanCharacter" ADD CONSTRAINT "PlanCharacter_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
