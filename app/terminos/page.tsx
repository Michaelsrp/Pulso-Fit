import Link from "next/link";

export default function TermsPage() {
  return <main className="legal-page">
    <Link href="/" className="text-link">← Volver a Pulso Fit</Link>
    <h1>Términos de uso de Pulso Fit</h1>
    <p className="draft-note"><strong>Borrador jurídico.</strong> Este texto es una base informativa para Colombia. Debe ser revisado y ajustado por un abogado antes de publicarse o utilizarse como documento vinculante.</p>
    <p><strong>Última actualización:</strong> 18 de noviembre de 2026.</p>
    <h2>1. Finalidad del servicio</h2><p>Pulso Fit ofrece herramientas digitales de organización de actividad física, contenidos generales de bienestar y espacios de interacción comunitaria. Sus rutinas y sugerencias son informativas y no constituyen diagnóstico, tratamiento ni prescripción médica, fisioterapéutica o nutricional.</p>
    <h2>2. Edad mínima</h2><p>El registro está dirigido exclusivamente a personas mayores de 18 años. Al crear una cuenta, la persona declara que cumple esta condición y que la información aportada es veraz y actualizada.</p>
    <h2>3. Uso responsable</h2><p>La persona usuaria debe adaptar la actividad a su condición y experiencia, utilizar espacios y equipos seguros y detener el ejercicio ante dolor, mareo, dificultad respiratoria inusual o cualquier malestar. Ante dudas o condiciones particulares debe consultar a un profesional de salud.</p>
    <h2>4. Información personal y datos relacionados con la salud</h2><p>El perfil puede incluir peso, estatura, fecha de nacimiento, objetivos y preferencias de entrenamiento. Estos datos pueden revelar aspectos relacionados con la salud y requieren especial cuidado. Su tratamiento se describe en la Política de privacidad y se somete a la Ley 1581 de 2012 y sus normas reglamentarias, según corresponda. La persona puede solicitar consulta, actualización, rectificación o supresión conforme a los canales y excepciones legales aplicables.</p>
    <h2>5. Comunidad y contenidos</h2><p>La persona conserva responsabilidad sobre las fotografías, textos y comentarios que publique. No debe compartir material ajeno sin autorización, información privada de terceros, contenido discriminatorio, amenazas ni material ilegal. Pulso Fit puede revisar reportes y ocultar o retirar contenido que incumpla estas reglas.</p>
    <h2>6. Disponibilidad y cambios</h2><p>El servicio puede cambiar, suspender funciones o presentar interrupciones por mantenimiento, seguridad o dependencias técnicas. Las estimaciones y recomendaciones pueden contener errores; deben verificarse y no reemplazan el criterio profesional.</p>
    <h2>7. Contacto y aceptación</h2><p>Las consultas sobre el servicio y los datos personales pueden remitirse al canal de contacto indicado por el responsable del proyecto. La aceptación de estos términos es necesaria para crear una cuenta. El responsable debe completar su identificación y canales de atención antes de publicar esta versión.</p>
    <p><Link href="/privacidad" className="text-link">Leer la Política de privacidad</Link></p>
  </main>;
}
