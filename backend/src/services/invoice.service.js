import BasePDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env.js';
import { GymSettings } from '../models/GymSettings.js';
import { Invoice } from '../models/Invoice.js';

// Safe interop for PDFKit across different ESM environments
const PDFDocument = BasePDFDocument.default || BasePDFDocument;

const formatCurrency = (amount) => `₹${Number(amount).toLocaleString('en-IN')}`;
const formatDate = (date) => new Date(date).toLocaleDateString('en-IN');

export const generateInvoiceNumber = async (gymId) => {
  const settings = await GymSettings.findOneAndUpdate(
    { gymId },
    { $inc: { invoiceCounter: 1 } },
    { new: true, upsert: true }
  );
  const num = String(settings.invoiceCounter).padStart(6, '0');
  return `REC${num}`;
};

export const createInvoice = async ({ gym, member, membership, payment, planName, settings }) => {
  const invoiceNumber = await generateInvoiceNumber(gym._id);
  const publicToken = uuidv4();

  const invoiceLink = `${env.clientUrl}/invoice/${publicToken}`;
  const qrCodeDataUrl = await QRCode.toDataURL(invoiceLink);

  const invoice = await Invoice.create({
    gymId: gym._id,
    memberId: member._id,
    membershipId: membership._id,
    paymentId: payment._id,
    invoiceNumber,
    template: settings?.defaultReceiptTemplate || 'professional_white',
    gymSnapshot: {
      name: gym.name,
      logo: gym.logo,
      address: gym.address,
      mobile: gym.mobile,
      email: gym.email,
    },
    memberSnapshot: { memberId: member.memberId, fullName: member.fullName, mobile: member.mobile },
    membershipSnapshot: {
      planName,
      startDate: membership.startDate,
      endDate: membership.endDate,
    },
    lineItems: {
      baseAmount: membership.baseAmount,
      discount: membership.discount?.amount || 0,
      tax: membership.tax?.amount || 0,
      finalAmount: membership.finalAmount,
      paidAmount: payment.paidAmount,
      dueAmount: payment.dueAmount,
    },
    paymentMethod: payment.paymentMethod,
    publicToken,
    qrCodeUrl: qrCodeDataUrl,
  });

  return invoice;
};

export const generateInvoicePDF = (invoice) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const { gymSnapshot, memberSnapshot, membershipSnapshot, lineItems, template } = invoice;

    if (template === 'professional_white') {
      generateProfessionalWhite(doc, invoice);
    } else if (template === 'modern_blue') {
      generateModernBlue(doc, invoice);
    } else if (template === 'premium_gold') {
      generatePremiumGold(doc, invoice);
    } else {
      generateProfessionalWhite(doc, invoice);
    }

    doc.end();
  });
};

const generateProfessionalWhite = (doc, invoice) => {
  const { gymSnapshot, memberSnapshot, membershipSnapshot, lineItems } = invoice;

  doc.fontSize(20).text(gymSnapshot.name, { align: 'center' });
  doc.fontSize(10).text(gymSnapshot.address || '', { align: 'center' });
  doc.text(`${gymSnapshot.mobile || ''} | ${gymSnapshot.email || ''}`, { align: 'center' });
  doc.moveDown();

  doc.fontSize(14).text('RECEIPT', { align: 'center' });
  doc.fontSize(10).text(`Receipt No: ${invoice.invoiceNumber}`, { align: 'right' });
  doc.text(`Date: ${formatDate(invoice.createdAt)}`, { align: 'right' });
  doc.moveDown();

  doc.text(`Member ID: ${memberSnapshot.memberId || '-'}`);
  doc.text(`Member: ${memberSnapshot.fullName}`);
  doc.text(`Mobile: ${memberSnapshot.mobile}`);
  doc.text(`Plan: ${membershipSnapshot.planName}`);
  doc.text(`Period: ${formatDate(membershipSnapshot.startDate)} - ${formatDate(membershipSnapshot.endDate)}`);
  doc.moveDown();

  doc.text(`Plan Amount: ${formatCurrency(lineItems.baseAmount)}`);
  if (lineItems.discount > 0) {
    doc.text(`Discount: -${formatCurrency(lineItems.discount)}`);
  }
  if (lineItems.tax > 0) {
    doc.text(`Tax: ${formatCurrency(lineItems.tax)}`);
  }
  doc.fontSize(12).text(`Final Amount: ${formatCurrency(lineItems.finalAmount)}`, { underline: true });
  doc.text(`Paid: ${formatCurrency(lineItems.paidAmount)}`);
  if (lineItems.dueAmount > 0) {
    doc.text(`Due: ${formatCurrency(lineItems.dueAmount)}`);
  }
  doc.text(`Payment Method: ${invoice.paymentMethod?.toUpperCase()}`);
};

const generateModernBlue = (doc, invoice) => {
  const { gymSnapshot, memberSnapshot, membershipSnapshot, lineItems } = invoice;

  doc.fillColor('#1e40af').fontSize(24).text(gymSnapshot.name, { align: 'center' });
  doc.fillColor('#000').fontSize(10).text(gymSnapshot.address || '', { align: 'center' });
  doc.text(`${gymSnapshot.mobile || ''} | ${gymSnapshot.email || ''}`, { align: 'center' });
  doc.moveDown();

  doc.fillColor('#1e40af').fontSize(16).text('RECEIPT', { align: 'center' });
  doc.fillColor('#000').fontSize(10).text(`Receipt No: ${invoice.invoiceNumber}`, { align: 'right' });
  doc.text(`Date: ${formatDate(invoice.createdAt)}`, { align: 'right' });
  doc.moveDown();

  doc.text(`Member ID: ${memberSnapshot.memberId || '-'}`);
  doc.text(`Member: ${memberSnapshot.fullName}`);
  doc.text(`Mobile: ${memberSnapshot.mobile}`);
  doc.text(`Plan: ${membershipSnapshot.planName}`);
  doc.text(`Period: ${formatDate(membershipSnapshot.startDate)} - ${formatDate(membershipSnapshot.endDate)}`);
  doc.moveDown();

  doc.text(`Plan Amount: ${formatCurrency(lineItems.baseAmount)}`);
  if (lineItems.discount > 0) {
    doc.text(`Discount: -${formatCurrency(lineItems.discount)}`);
  }
  if (lineItems.tax > 0) {
    doc.text(`Tax: ${formatCurrency(lineItems.tax)}`);
  }
  doc.fillColor('#1e40af').fontSize(12).text(`Final Amount: ${formatCurrency(lineItems.finalAmount)}`, { underline: true });
  doc.fillColor('#000').text(`Paid: ${formatCurrency(lineItems.paidAmount)}`);
  if (lineItems.dueAmount > 0) {
    doc.text(`Due: ${formatCurrency(lineItems.dueAmount)}`);
  }
  doc.text(`Payment Method: ${invoice.paymentMethod?.toUpperCase()}`);
};

const generatePremiumGold = (doc, invoice) => {
  const { gymSnapshot, memberSnapshot, membershipSnapshot, lineItems } = invoice;

  doc.fillColor('#b8860b').fontSize(24).text(gymSnapshot.name, { align: 'center' });
  doc.fillColor('#000').fontSize(10).text(gymSnapshot.address || '', { align: 'center' });
  doc.text(`${gymSnapshot.mobile || ''} | ${gymSnapshot.email || ''}`, { align: 'center' });
  doc.moveDown();

  doc.fillColor('#b8860b').fontSize(16).text('RECEIPT', { align: 'center' });
  doc.fillColor('#000').fontSize(10).text(`Receipt No: ${invoice.invoiceNumber}`, { align: 'right' });
  doc.text(`Date: ${formatDate(invoice.createdAt)}`, { align: 'right' });
  doc.moveDown();

  doc.text(`Member ID: ${memberSnapshot.memberId || '-'}`);
  doc.text(`Member: ${memberSnapshot.fullName}`);
  doc.text(`Mobile: ${memberSnapshot.mobile}`);
  doc.text(`Plan: ${membershipSnapshot.planName}`);
  doc.text(`Period: ${formatDate(membershipSnapshot.startDate)} - ${formatDate(membershipSnapshot.endDate)}`);
  doc.moveDown();

  doc.text(`Plan Amount: ${formatCurrency(lineItems.baseAmount)}`);
  if (lineItems.discount > 0) {
    doc.text(`Discount: -${formatCurrency(lineItems.discount)}`);
  }
  if (lineItems.tax > 0) {
    doc.text(`Tax: ${formatCurrency(lineItems.tax)}`);
  }
  doc.fillColor('#b8860b').fontSize(12).text(`Final Amount: ${formatCurrency(lineItems.finalAmount)}`, { underline: true });
  doc.fillColor('#000').text(`Paid: ${formatCurrency(lineItems.paidAmount)}`);
  if (lineItems.dueAmount > 0) {
    doc.text(`Due: ${formatCurrency(lineItems.dueAmount)}`);
  }
  doc.text(`Payment Method: ${invoice.paymentMethod?.toUpperCase()}`);
};