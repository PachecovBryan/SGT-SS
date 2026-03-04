import React from 'react';
import { Page, Text as PdfText, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { IMAGEN_URL } from './api'; 

const styles = StyleSheet.create({
  page: { paddingTop: 40, paddingBottom: 60, paddingHorizontal: 50, fontFamily: 'Helvetica', fontSize: 11, lineHeight: 1.5 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 60, marginBottom: 20, borderBottomWidth: 1, borderColor: '#ccc' },
  logo: { width: 50, height: 50, objectFit: 'contain' },
  headerText: { flex: 1, textAlign: 'center', paddingHorizontal: 10 },
  instName: { fontSize: 12, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' },
  facName: { fontSize: 10 },
  asuntoBlock: { alignItems: 'flex-end', marginBottom: 20 },
  asuntoText: { fontSize: 10, fontFamily: 'Helvetica-Bold' },
  cuerpo: { textAlign: 'justify', marginBottom: 12 },
  bold: { fontFamily: 'Helvetica-Bold' },
  datosTabla: { marginVertical: 10, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 4 },
  fila: { flexDirection: 'row', marginBottom: 4 },
  etiqueta: { width: '35%', fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#444' }, 
  valor: { width: '65%', fontSize: 9 },
  firmaSection: { marginTop: 60, alignItems: 'center' },
  lineaFirma: { width: 200, borderTopWidth: 1, borderColor: '#000', marginBottom: 5 },
  textoFirma: { fontSize: 10, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' },
  cargoFirma: { fontSize: 9 },
  footer: { position: 'absolute', bottom: 30, left: 50, right: 50, textAlign: 'center', fontSize: 8, color: 'gray' },
  lema: { fontSize: 9, fontFamily: 'Helvetica-Oblique', marginTop: 5, color: '#444' }
});

const formatearFechaPDF = (fecha) => {
    if (!fecha) return '---';
    return new Date(fecha).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
};

const DocumentoPDF = ({ alumno, config }) => {
  if (!alumno) return <Document><Page><PdfText>Sin datos.</PdfText></Page></Document>;

  const nombreCarrera = alumno.carrera?.nombre || 'Sin Carrera';
  const directorObj = alumno.comite?.find(c => c.cargo.nombre.includes('Director'));
  const nombreDirector = directorObj ? directorObj.personal.nombre_completo : 'Sin asignar';

  const institucion = config?.nombre_institucion || 'NOMBRE INSTITUCIÓN';
  const facultad = config?.nombre_facultad || '';
  const coordinador = config?.nombre_coordinador || 'NOMBRE FUNCIONARIO';
  const cargoCoord = config?.cargo_coordinador || 'CARGO FUNCIONARIO';
  
  const logoIzq = config?.logo_izq_url ? `${IMAGEN_URL}${config.logo_izq_url}` : null;
  const logoDer = config?.logo_der_url ? `${IMAGEN_URL}${config.logo_der_url}` : null;
  
  const lugar = config?.lugar_expedicion || 'Ciudad';
  const asunto = config?.texto_asunto || 'Constancia de Expediente';
  const parrafo1 = config?.texto_parrafo_1 || 'Por medio de la presente se hace constar el estado actual del expediente del alumno:';
  const parrafo2 = config?.texto_parrafo_2 || 'Se extiende la presente para los fines que al interesado convengan.';
  const despedida = config?.texto_despedida || 'ATENTAMENTE';
  const lema = config?.lema_universitario || ''; 
  const ccp1 = config?.ccp_1 ? `c.c.p. ${config.ccp_1}` : '';
  const ccp2 = config?.ccp_2 ? `c.c.p. ${config.ccp_2}` : '';
  const fechaHoy = new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        
        {/* ENCABEZADO */}
        <View style={styles.header}>
            {logoIzq ? <Image src={logoIzq} style={styles.logo} /> : <View style={{width:50}} />}
            <View style={styles.headerText}>
                <PdfText style={styles.instName}>{institucion}</PdfText>
                <PdfText style={styles.facName}>{facultad}</PdfText>
            </View>
            {logoDer ? <Image src={logoDer} style={styles.logo} /> : <View style={{width:50}} />}
        </View>
        
        {/* ASUNTO */}
        <View style={styles.asuntoBlock}>
            <PdfText style={styles.asuntoText}>{asunto}</PdfText>
            <PdfText style={{ fontSize: 10 }}>{lugar}, a {fechaHoy}</PdfText>
        </View>

        <PdfText style={styles.cuerpo}>{parrafo1}</PdfText>

        {/* TABLA DE DATOS  */}
        <View style={styles.datosTabla}>
            <View style={styles.fila}><PdfText style={styles.etiqueta}>ALUMNO:</PdfText><PdfText style={styles.valor}>{alumno.nombre_completo}</PdfText></View>
            <View style={styles.fila}><PdfText style={styles.etiqueta}>CUENTA:</PdfText><PdfText style={styles.valor}>{alumno.no_cuenta}</PdfText></View>
            <View style={styles.fila}><PdfText style={styles.etiqueta}>CARRERA:</PdfText><PdfText style={styles.valor}>{nombreCarrera}</PdfText></View>
            <View style={styles.fila}><PdfText style={styles.etiqueta}>TEMA TESIS:</PdfText><PdfText style={styles.valor}>{alumno.tema_tesis}</PdfText></View>
            <View style={styles.fila}><PdfText style={styles.etiqueta}>DIRECTOR:</PdfText><PdfText style={styles.valor}>{nombreDirector}</PdfText></View>
            
            {/* Folios-examen */}
            {alumno.folio_tesis && (
                <View style={styles.fila}><PdfText style={styles.etiqueta}>FOLIO REGISTRO:</PdfText><PdfText style={styles.valor}>{alumno.folio_tesis}</PdfText></View>
            )}
            {alumno.fecha_examen_replica && (
                <View style={styles.fila}><PdfText style={styles.etiqueta}>FECHA EXAMEN:</PdfText><PdfText style={styles.valor}>{formatearFechaPDF(alumno.fecha_examen_replica)}</PdfText></View>
            )}
            {alumno.folio_examen_replica && (
                <View style={styles.fila}><PdfText style={styles.etiqueta}>FOLIO ACTA:</PdfText><PdfText style={styles.valor}>{alumno.folio_examen_replica}</PdfText></View>
            )}
        </View>

        <PdfText style={styles.cuerpo}>{parrafo2}</PdfText>

        {/* FIRMA */}
        <View style={styles.firmaSection}>
            <PdfText style={{ marginBottom: 40 }}>{despedida}</PdfText>
            <View style={styles.lineaFirma} />
            <PdfText style={styles.textoFirma}>{coordinador}</PdfText>
            <PdfText style={styles.cargoFirma}>{cargoCoord}</PdfText>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
            <PdfText style={styles.lema}>{lema}</PdfText>
            <View style={{ alignItems: 'flex-start', width: '100%', marginTop: 10 }}>
                {ccp1 && <PdfText style={{ fontSize: 7 }}>{ccp1}</PdfText>}
                {ccp2 && <PdfText style={{ fontSize: 7 }}>{ccp2}</PdfText>}
            </View>
            <PdfText style={{ marginTop: 5 }}>{config?.direccion_facultad} | Tel: {config?.telefonos_contacto}</PdfText>
        </View>

      </Page>
    </Document>
  );
};

export default DocumentoPDF;