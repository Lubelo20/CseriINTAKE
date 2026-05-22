import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const NAVY = '#142444'
const ORANGE = '#F07A1A'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#222' },
  headerBar: { backgroundColor: NAVY, padding: 16, borderRadius: 4, marginBottom: 16 },
  headerTitle: { color: 'white', fontSize: 16, fontFamily: 'Helvetica-Bold' },
  headerSub: { color: '#93c5fd', fontSize: 9, marginTop: 3 },
  refBox: { backgroundColor: NAVY, padding: 10, borderRadius: 4, marginBottom: 20 },
  refText: { color: 'white', fontSize: 14, fontFamily: 'Helvetica-Bold', textAlign: 'center' },
  section: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 8, color: '#9ca3af', textTransform: 'uppercase',
    marginBottom: 5, fontFamily: 'Helvetica-Bold', letterSpacing: 1,
  },
  label: { fontSize: 9, color: '#374151', fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  value: { fontSize: 10, color: '#111827', lineHeight: 1.5, marginBottom: 8 },
  badgeRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  badge: {
    backgroundColor: ORANGE, color: 'white',
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 3, fontSize: 8,
  },
  divider: { borderBottom: '1 solid #e5e7eb', marginVertical: 12 },
  notice: { backgroundColor: '#fef3c7', padding: 8, borderRadius: 4, marginBottom: 14 },
  noticeText: { fontSize: 8, color: '#92400e' },
  intlBox: { backgroundColor: '#eff6ff', padding: 8, borderRadius: 4 },
  intlText: { fontSize: 9, color: '#1e40af' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, borderTop: '1 solid #e5e7eb', paddingTop: 8 },
  footerText: { fontSize: 7, color: '#9ca3af', textAlign: 'center' },
})

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
  const date = new Date(submission.created_at).toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <Document
      title={`CSERI Intake — ${submission.reference_no}`}
      author="CSERI Community Intake System"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>CSERI Community Intake</Text>
          <Text style={styles.headerSub}>
            Centre for Social Entrepreneurship — Durban University of Technology
          </Text>
          <Text style={styles.headerSub}>Submitted: {date}</Text>
        </View>

        <View style={styles.refBox}>
          <Text style={styles.refText}>{submission.reference_no}</Text>
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            POPIA Notice: Contact details (name, email, phone) are not included in this document in
            accordance with the Protection of Personal Information Act. They are accessible only to
            authorised CSERI staff via the admin dashboard.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Submission Info</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}><Text>{submission.category}</Text></View>
            <View style={styles.badge}><Text>{submission.province.toUpperCase()}</Text></View>
            <View style={styles.badge}><Text>{submission.urgency}</Text></View>
            <View style={styles.badge}><Text>{submission.role.replace(/_/g, ' ')}</Text></View>
          </View>
          <Text style={styles.label}>Language Used</Text>
          <Text style={styles.value}>{submission.language_used.toUpperCase()}</Text>
        </View>

        <View style={styles.divider} />

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

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {submission.reference_no} · Generated by CSERI Intake System · cseri-intake.vercel.app
          </Text>
        </View>
      </Page>
    </Document>
  )
}
