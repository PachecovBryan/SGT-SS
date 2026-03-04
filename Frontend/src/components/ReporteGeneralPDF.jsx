import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { IMAGEN_URL } from '../api'; 

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#333' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#ccc', paddingBottom: 10 },
  headerText: { textAlign: 'center', width: '70%' },
  title: { fontSize: 14, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' },
  subtitle: { fontSize: 10, color: '#666', marginTop: 4 },
  
  // Secciones
  sectionTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', marginTop: 25, marginBottom: 10, color: '#1c7ed6', textTransform: 'uppercase' },
  
  // KPIs Box
  kpiContainer: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#f8f9fa', padding: 15, borderRadius: 5, marginBottom: 10 },
  kpiItem: { alignItems: 'center', width: '30%' },
  kpiValue: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#1c7ed6' },
  kpiLabel: { fontSize: 8, textTransform: 'uppercase', color: '#868e96', marginTop: 2 },

  // Tablas
  table: { display: "table", width: "auto", borderStyle: "solid", borderWidth: 1, borderColor: '#dee2e6', borderRightWidth: 0, borderBottomWidth: 0 },
  tableRow: { margin: "auto", flexDirection: "row" },
  tableCol: { borderStyle: "solid", borderWidth: 1, borderColor: '#dee2e6', borderLeftWidth: 0, borderTopWidth: 0 },
  tableHeader: { backgroundColor: '#e9ecef', margin: 5, fontSize: 8, fontFamily: 'Helvetica-Bold' },
  tableCell: { margin: 5, fontSize: 9 },

  // Alerta
  alertBox: { marginTop: 20, padding: 10, backgroundColor: '#fff5f5', borderLeftWidth: 4, borderLeftColor: '#fa5252' },
  alertTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#c92a2a' },

  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#adb5bd', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 }
});

const ReporteGeneralPDF = ({ data, config }) => {
  const fechaImpresion = new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  // Logos
  const logoIzq = config?.logo_izq_url ? `${IMAGEN_URL}${config.logo_izq_url}` : null;

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        
        {/* ENCABEZADO */}
        <View style={styles.header}>
            {logoIzq ? <Image src={logoIzq} style={{ width: 45, height: 45, objectFit: 'contain' }} /> : <View style={{width:45}} />}
            <View style={styles.headerText}>
                <Text style={styles.title}>Reporte de datos de Titulación</Text>
                <Text style={styles.subtitle}>{config?.nombre_facultad || 'Facultad de Ingeniería los Mochis'}</Text>
                <Text style={{ fontSize: 8, color: '#999', marginTop: 2 }}>Corte al: {fechaImpresion}</Text>
            </View>
            <View style={{width:45}} /> 
        </View>

        {/* KPIs PRINCIPALES */}
        <View style={styles.kpiContainer}>
            <View style={styles.kpiItem}>
                <Text style={styles.kpiValue}>{data.kpis.total}</Text>
                <Text style={styles.kpiLabel}>Matrícula Activa</Text>
            </View>
            <View style={styles.kpiItem}>
                <Text style={styles.kpiValue}>{data.kpis.titulados}</Text>
                <Text style={styles.kpiLabel}>Titulados Totales</Text>
            </View>
            <View style={styles.kpiItem}>
                <Text style={styles.kpiValue}>{data.kpis.enProceso}</Text>
                <Text style={styles.kpiLabel}>En Proceso</Text>
            </View>
        </View>

        {/* DETALLE POR CARRERA */}
        <Text style={styles.sectionTitle}>Desglose por Carrera</Text>
        <View style={styles.table}>
            <View style={styles.tableRow}>
                <View style={{ ...styles.tableCol, width: '75%' }}><Text style={styles.tableHeader}>PROGRAMA EDUCATIVO</Text></View>
                <View style={{ ...styles.tableCol, width: '25%' }}><Text style={styles.tableHeader}>TESISTAS</Text></View>
            </View>
            {data.graficas.porCarrera.map((item, index) => (
                <View key={index} style={styles.tableRow}>
                    <View style={{ ...styles.tableCol, width: '75%' }}><Text style={styles.tableCell}>{item.nombreCompleto}</Text></View>
                    <View style={{ ...styles.tableCol, width: '25%' }}><Text style={styles.tableCell}>{item.cantidad}</Text></View>
                </View>
            ))}
        </View>

        {/* CARGA ACADÉMICA DIRECTORES*/}
        <Text style={styles.sectionTitle}>Directores con Mayor Carga</Text>
        <View style={styles.table}>
            <View style={styles.tableRow}>
                <View style={{ ...styles.tableCol, width: '75%' }}><Text style={styles.tableHeader}>PROFESOR</Text></View>
                <View style={{ ...styles.tableCol, width: '25%' }}><Text style={styles.tableHeader}>ALUMNOS ACTIVOS</Text></View>
            </View>
            {data.tablas.topDirectores.map((item, index) => (
                <View key={index} style={styles.tableRow}>
                    <View style={{ ...styles.tableCol, width: '75%' }}><Text style={styles.tableCell}>{item.nombre}</Text></View>
                    <View style={{ ...styles.tableCol, width: '25%' }}><Text style={styles.tableCell}>{item.alumnos}</Text></View>
                </View>
            ))}
        </View>

        {/* ALERTAS DE REZAGO */}
        {data.tablas.rezagados.length > 0 ? (
            <View>
                <Text style={{ ...styles.sectionTitle, color: '#c92a2a' }}>Alerta de Rezagos (+2 Años)</Text>
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <View style={{ ...styles.tableCol, width: '20%' }}><Text style={styles.tableHeader}>CUENTA</Text></View>
                        <View style={{ ...styles.tableCol, width: '55%' }}><Text style={styles.tableHeader}>ALUMNO</Text></View>
                        <View style={{ ...styles.tableCol, width: '25%' }}><Text style={styles.tableHeader}>INGRESO</Text></View>
                    </View>
                    {data.tablas.rezagados.map((item, index) => (
                        <View key={index} style={styles.tableRow}>
                            <View style={{ ...styles.tableCol, width: '20%' }}><Text style={styles.tableCell}>{item.no_cuenta}</Text></View>
                            <View style={{ ...styles.tableCol, width: '55%' }}><Text style={styles.tableCell}>{item.nombre_completo}</Text></View>
                            <View style={{ ...styles.tableCol, width: '25%' }}><Text style={styles.tableCell}>{new Date(item.fecha_aceptacion).toLocaleDateString()}</Text></View>
                        </View>
                    ))}
                </View>
            </View>
        ) : (
            <View style={styles.alertBox}>
                <Text style={{...styles.alertTitle, color: '#2b8a3e'}}>Sin rezagos críticos</Text>
                <Text style={{fontSize: 9, marginTop: 2}}>Todos los expedientes se encuentran dentro del tiempo esperado.</Text>
            </View>
        )}

        {/* PIE DE PÁGINA */}
        <View style={styles.footer}>
            <Text>Sistema Gestor de Titulación (SGT) - Documento generado para uso administrativo interno.</Text>
            <Text>{config?.direccion_facultad}</Text>
        </View>

      </Page>
    </Document>
  );
};

export default ReporteGeneralPDF;