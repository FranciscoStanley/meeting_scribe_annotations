-- CreateTable
CREATE TABLE "CalendarAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MeetingSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalId" TEXT,
    "title" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "joinUrl" TEXT,
    "scheduledStart" DATETIME NOT NULL,
    "scheduledEnd" DATETIME,
    "startedAt" DATETIME,
    "endedAt" DATETIME,
    "alertSentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SpeakerProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "displayName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SpeakerProfile_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "MeetingSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TranscriptSegment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "speakerId" TEXT,
    "speakerLabel" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "confidence" REAL,
    "startedAt" DATETIME NOT NULL,
    "endedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TranscriptSegment_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "MeetingSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TranscriptSegment_speakerId_fkey" FOREIGN KEY ("speakerId") REFERENCES "SpeakerProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CalendarAccount_provider_email_key" ON "CalendarAccount"("provider", "email");

-- CreateIndex
CREATE INDEX "CalendarAccount_provider_idx" ON "CalendarAccount"("provider");

-- CreateIndex
CREATE INDEX "MeetingSession_status_idx" ON "MeetingSession"("status");

-- CreateIndex
CREATE INDEX "MeetingSession_scheduledStart_idx" ON "MeetingSession"("scheduledStart");

-- CreateIndex
CREATE INDEX "MeetingSession_externalId_idx" ON "MeetingSession"("externalId");

-- CreateIndex
CREATE INDEX "SpeakerProfile_sessionId_idx" ON "SpeakerProfile"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "SpeakerProfile_sessionId_label_key" ON "SpeakerProfile"("sessionId", "label");

-- CreateIndex
CREATE INDEX "TranscriptSegment_sessionId_startedAt_idx" ON "TranscriptSegment"("sessionId", "startedAt");

-- CreateIndex
CREATE INDEX "TranscriptSegment_speakerId_idx" ON "TranscriptSegment"("speakerId");
