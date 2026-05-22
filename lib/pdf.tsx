import React from 'react'
import fs from 'fs'
import path from 'path'
import { Document, Page, Text, View, Image as PDFImage, StyleSheet } from '@react-pdf/renderer'

const GREEN  = '#9ABF35'
const ORANGE = '#E38642'
const DARK   = '#181717'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: DARK },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, borderBottom: `2 solid ${GREEN}`, paddingBottom: 12 },
  logo: { width: 180, height: 52, objectFit: 'contain' },
  headerText: { marginLeft: 'auto', textAlign: 'right' },
  headerTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: DARK },
  headerSub: { fontSize: 8, color: '#6b6b6c', marginTop: 2 },
  refBox: { backgroundColor: DARK, padding: 10, borderRadius: 4, marginBottom: 16 },
  refText: { color: 'white', fontSize: 14, fontFamily: 'Helvetica-Bold', textAlign: 'center' },
  section: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 8, color: '#6b6b6c', textTransform: 'uppercase',
    marginBottom: 5, fontFamily: 'Helvetica-Bold', letterSpacing: 1,
    borderBottom: `1 solid #e5ebec`, paddingBottom: 3,
  },
  label: { fontSize: 9, color: DARK, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  value: { fontSize: 10, color: '#333', lineHeight: 1.5, marginBottom: 8 },
  badgeRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  badge: {
    backgroundColor: GREEN, color: 'white',
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 3, fontSize: 8,
  },
  badgeOrange: {
    backgroundColor: ORANGE, color: 'white',
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 3, fontSize: 8,
  },
  notice: { backgroundColor: '#f9f6e8', padding: 8, borderRadius: 4, marginBottom: 14, border: `1 solid #FFCF05` },
  noticeText: { fontSize: 8, color: '#5a4a00' },
  intlBox: { backgroundColor: '#f0f7e8', padding: 8, borderRadius: 4, border: `1 solid ${GREEN}` },
  intlText: { fontSize: 9, color: '#4a6a00' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, borderTop: `1 solid #e5ebec`, paddingTop: 8 },
  footerText: { fontSize: 7, color: '#939393', textAlign: 'center' },
})

function getLogoDataUrl(): string {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png')
    const buffer = fs.readFileSync(logoPath)
    return `data:image/png;base64,${buffer.toString('base64')}`
  } catch {
    return ''
  }
}

export interface SubmissionPDFProps {
  submission: {
    reference_no: string
    created_at: string
    role: string
    challenge_title: string
    challenge_description: string
    category: string
    province: string
    urgency: string
    proposed_solution: string
    background_info: string
    suits_intl_students: boolean
    language_used: string
  }
}

export function SubmissionPDF({ submission }: SubmissionPDFProps) {
  const logoDataUrl = getLogoDataUrl()
  const date = new Date(submission.created_at).toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  const urgencyColour = submission.urgency === 'critical' || submission.urgency === 'high'
    ? ORANGE : GREEN

  return (
    <Document
      title={`CSERI Intake — ${submission.reference_no}`}
      author="CSERI Community Intake System"
    >
      <Page size="A4" style={styles.page}>

        {/* Header with logo */}
        <View style={styles.headerRow}>
          {logoDataUrl
            ? <PDFImage src={logoDataUrl} style={styles.logo} />
            : <Text style={styles.headerTitle}>CSERI — DUT</Text>
          }
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Community Intake Form</Text>
            <Text style={styles.headerSub}>Submitted: {date}</Text>
          </View>
        </View>

        {/* Reference number */}
        <View style={styles.refBox}>
          <Text style={styles.refText}>{submission.reference_no}</Text>
        </View>

        {/* POPIA notice */}
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            POPIA Notice: Contact details (name, email, phone) are not included in this document
            in accordance with the Protection of Personal Information Act. They are accessible
            only to authorised CSERI staff via the admin dashboard.
          </Text>
        </View>

        {/* Submission metadata */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Submission Details</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}><Text>{submission.category}</Text></View>
            <View style={styles.badge}><Text>{submission.province.toUpperCase()}</Text></View>
            <View style={{ ...styles.badgeOrange, backgroundColor: urgencyColour }}>
              <Text>{submission.urgency}</Text>
            </View>
            <View style={styles.badge}><Text>{submission.role.replace(/_/g, ' ')}</Text></View>
          </View>
          <Text style={styles.label}>Language Used</Text>
          <Text style={styles.value}>{submission.language_used.toUpperCase()}</Text>
        </View>

        {/* Challenge */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Challenge</Text>
          <Text style={styles.label}>Title</Text>
          <Text style={styles.value}>{submission.challenge_title}</Text>
          <Text style={styles.label}>Description</Text>
          <Text style={styles.value}>{submission.challenge_description}</Text>
        </View>

        {submission.proposed_solution ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Proposed Solution</Text>
            <Text style={styles.value}>{submission.proposed_solution}</Text>
          </View>
        ) : null}

        {submission.background_info ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Background Information</Text>
            <Text style={styles.value}>{submission.background_info}</Text>
          </View>
        ) : null}

        {submission.suits_intl_students ? (
          <View style={styles.intlBox}>
            <Text style={styles.intlText}>
              ✓ This challenge is suitable for international student research projects
            </Text>
          </View>
        ) : null}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {submission.reference_no} · CSERI Community Intake · Centre for Social Entrepreneurship, Durban University of Technology · cseri-intake.vercel.app
          </Text>
        </View>
      </Page>
    </Document>
  )
}
