import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const PhishingAnalysisModal = ({ visible, result, onClose }) => {
    if (!result) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose} // Fonctionne sur Android (bouton back)
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        <Text style={styles.title}>
                            {result.is_phishing ? "🚨 Alerte Phishing" : "✅ Message Sûr"}
                        </Text>
                        <Text style={styles.label}>📊 Score de Risque :</Text>
                        <Text style={styles.text}>{result.risk_score} / 100</Text>

                        <Text style={styles.label}>💡 Conseil :</Text>
                        <Text style={styles.text}>{result.advice}</Text>
                        <Text style={styles.label}>🧠 Analyse :</Text>
                        <Text style={styles.text}>{result.analysis}</Text>
                    </ScrollView>

                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Fermer</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default PhishingAnalysisModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
    },
    scrollContainer: {
        paddingBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
        color: '#e74c3c',
    },
    label: {
        fontWeight: 'bold',
        marginTop: 10,
        fontSize: 16,
        color: '#34495e',
    },
    text: {
        fontSize: 14,
        marginBottom: 10,
        color: '#2c3e50',
    },
    closeButton: {
        backgroundColor: '#3498db',
        padding: 12,
        borderRadius: 10,
        marginTop: 10,
        alignItems: 'center',
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});