import bcrypt from "bcrypt";
import { storage } from "./storage";
import { pool } from "./db";

export async function seedReferenceData() {
  console.log("Verificando datos de referencia...");

  const client = await pool.connect();
  try {
    const { rows: existingFamilias } = await client.query("SELECT COUNT(*) as c FROM familias_profesionales");
    if (parseInt(existingFamilias[0].c) === 0) {
      console.log("Insertando familias profesionales...");
      await client.query(`INSERT INTO familias_profesionales (name) VALUES
        ('Informática y Comunicaciones'),
        ('Administración y Gestión'),
        ('Comercio y Marketing'),
        ('Electricidad y Electrónica'),
        ('Sanidad'),
        ('Hostelería y Turismo'),
        ('Edificación y Obra Civil'),
        ('Fabricación Mecánica'),
        ('Imagen y Sonido'),
        ('Transporte y Mantenimiento de Vehículos'),
        ('Energía y Agua'),
        ('Actividades Físicas y Deportivas'),
        ('Artes Gráficas'),
        ('Industrias Alimentarias'),
        ('Química'),
        ('Servicios Socioculturales y a la Comunidad'),
        ('Seguridad y Medio Ambiente'),
        ('Agraria'),
        ('Marítimo-Pesquera'),
        ('Textil, Confección y Piel'),
        ('Instalación y Mantenimiento'),
        ('Madera, Mueble y Corcho'),
        ('Vidrio y Cerámica')
        ON CONFLICT (name) DO NOTHING`);
    }

    const { rows: existingCiclos } = await client.query("SELECT COUNT(*) as c FROM ciclos_formativos");
    if (parseInt(existingCiclos[0].c) === 0) {
      console.log("Insertando ciclos formativos...");
      await client.query(`INSERT INTO ciclos_formativos (name, familia_id)
        SELECT c.name, f.id FROM (VALUES
          ('CFGS Desarrollo de Aplicaciones Web (DAW)', 'Informática y Comunicaciones'),
          ('CFGS Desarrollo de Aplicaciones Multiplataforma (DAM)', 'Informática y Comunicaciones'),
          ('CFGS Administración de Sistemas Informáticos en Red (ASIR)', 'Informática y Comunicaciones'),
          ('CFGM Sistemas Microinformáticos y Redes (SMR)', 'Informática y Comunicaciones'),
          ('CFGS Administración y Finanzas', 'Administración y Gestión'),
          ('CFGS Asistencia a la Dirección', 'Administración y Gestión'),
          ('CFGM Gestión Administrativa', 'Administración y Gestión'),
          ('CFGS Marketing y Publicidad', 'Comercio y Marketing'),
          ('CFGS Comercio Internacional', 'Comercio y Marketing'),
          ('CFGS Gestión de Ventas y Espacios Comerciales', 'Comercio y Marketing'),
          ('CFGS Transporte y Logística', 'Comercio y Marketing'),
          ('CFGM Actividades Comerciales', 'Comercio y Marketing'),
          ('CFGS Sistemas Electrotécnicos y Automatizados', 'Electricidad y Electrónica'),
          ('CFGS Sistemas de Telecomunicaciones e Informáticos', 'Electricidad y Electrónica'),
          ('CFGS Automatización y Robótica Industrial', 'Electricidad y Electrónica'),
          ('CFGM Instalaciones Eléctricas y Automáticas', 'Electricidad y Electrónica'),
          ('CFGM Instalaciones de Telecomunicaciones', 'Electricidad y Electrónica'),
          ('CFGS Laboratorio Clínico y Biomédico', 'Sanidad'),
          ('CFGS Imagen para el Diagnóstico y Medicina Nuclear', 'Sanidad'),
          ('CFGS Higiene Bucodental', 'Sanidad'),
          ('CFGS Anatomía Patológica y Citodiagnóstico', 'Sanidad'),
          ('CFGM Cuidados Auxiliares de Enfermería', 'Sanidad'),
          ('CFGM Farmacia y Parafarmacia', 'Sanidad'),
          ('CFGM Emergencias Sanitarias', 'Sanidad'),
          ('CFGS Gestión de Alojamientos Turísticos', 'Hostelería y Turismo'),
          ('CFGS Agencias de Viajes y Gestión de Eventos', 'Hostelería y Turismo'),
          ('CFGS Dirección de Cocina', 'Hostelería y Turismo'),
          ('CFGS Dirección de Servicios de Restauración', 'Hostelería y Turismo'),
          ('CFGM Cocina y Gastronomía', 'Hostelería y Turismo'),
          ('CFGM Servicios en Restauración', 'Hostelería y Turismo'),
          ('CFGS Proyectos de Edificación', 'Edificación y Obra Civil'),
          ('CFGS Proyectos de Obra Civil', 'Edificación y Obra Civil'),
          ('CFGM Construcción', 'Edificación y Obra Civil'),
          ('CFGS Diseño en Fabricación Mecánica', 'Fabricación Mecánica'),
          ('CFGS Programación de la Producción en Fabricación Mecánica', 'Fabricación Mecánica'),
          ('CFGM Mecanizado', 'Fabricación Mecánica'),
          ('CFGM Soldadura y Calderería', 'Fabricación Mecánica'),
          ('CFGS Animaciones 3D, Juegos y Entornos Interactivos', 'Imagen y Sonido'),
          ('CFGS Producción de Audiovisuales y Espectáculos', 'Imagen y Sonido'),
          ('CFGS Realización de Proyectos Audiovisuales y Espectáculos', 'Imagen y Sonido'),
          ('CFGS Iluminación, Captación y Tratamiento de Imagen', 'Imagen y Sonido'),
          ('CFGS Sonido para Audiovisuales y Espectáculos', 'Imagen y Sonido'),
          ('CFGM Vídeo Disc-jockey y Sonido', 'Imagen y Sonido'),
          ('CFGS Automoción', 'Transporte y Mantenimiento de Vehículos'),
          ('CFGM Electromecánica de Vehículos Automóviles', 'Transporte y Mantenimiento de Vehículos'),
          ('CFGM Carrocería', 'Transporte y Mantenimiento de Vehículos'),
          ('CFGS Energías Renovables', 'Energía y Agua'),
          ('CFGS Eficiencia Energética y Energía Solar Térmica', 'Energía y Agua'),
          ('CFGM Redes e Instalaciones de Gas', 'Energía y Agua'),
          ('CFGS Enseñanza y Animación Sociodeportiva', 'Actividades Físicas y Deportivas'),
          ('CFGS Acondicionamiento Físico', 'Actividades Físicas y Deportivas'),
          ('CFGM Conducción de Actividades Físico-deportivas en el Medio Natural', 'Actividades Físicas y Deportivas'),
          ('CFGS Diseño y Producción Editorial', 'Artes Gráficas'),
          ('CFGS Diseño y Gestión de la Producción Gráfica', 'Artes Gráficas'),
          ('CFGM Preimpresión Digital', 'Artes Gráficas'),
          ('CFGM Impresión Gráfica', 'Artes Gráficas'),
          ('CFGS Vitivinicultura', 'Industrias Alimentarias'),
          ('CFGS Procesos y Calidad en la Industria Alimentaria', 'Industrias Alimentarias'),
          ('CFGM Elaboración de Productos Alimenticios', 'Industrias Alimentarias'),
          ('CFGM Aceites de Oliva y Vinos', 'Industrias Alimentarias'),
          ('CFGS Laboratorio de Análisis y de Control de Calidad', 'Química'),
          ('CFGS Química Industrial', 'Química'),
          ('CFGM Planta Química', 'Química'),
          ('CFGM Operaciones de Laboratorio', 'Química'),
          ('CFGS Educación Infantil', 'Servicios Socioculturales y a la Comunidad'),
          ('CFGS Integración Social', 'Servicios Socioculturales y a la Comunidad'),
          ('CFGS Animación Sociocultural y Turística', 'Servicios Socioculturales y a la Comunidad'),
          ('CFGS Mediación Comunicativa', 'Servicios Socioculturales y a la Comunidad'),
          ('CFGM Atención a Personas en Situación de Dependencia', 'Servicios Socioculturales y a la Comunidad'),
          ('CFGS Educación y Control Ambiental', 'Seguridad y Medio Ambiente'),
          ('CFGS Química y Salud Ambiental', 'Seguridad y Medio Ambiente'),
          ('CFGM Emergencias y Protección Civil', 'Seguridad y Medio Ambiente'),
          ('CFGS Gestión Forestal y del Medio Natural', 'Agraria'),
          ('CFGS Paisajismo y Medio Rural', 'Agraria'),
          ('CFGM Producción Agroecológica', 'Agraria'),
          ('CFGM Jardinería y Floristería', 'Agraria'),
          ('CFGS Transporte Marítimo y Pesca de Altura', 'Marítimo-Pesquera'),
          ('CFGS Organización del Mantenimiento de Maquinaria de Buques y Embarcaciones', 'Marítimo-Pesquera'),
          ('CFGM Navegación y Pesca de Litoral', 'Marítimo-Pesquera'),
          ('CFGS Patronaje y Moda', 'Textil, Confección y Piel'),
          ('CFGS Vestuario a Medida y de Espectáculos', 'Textil, Confección y Piel'),
          ('CFGM Confección y Moda', 'Textil, Confección y Piel'),
          ('CFGS Mecatrónica Industrial', 'Instalación y Mantenimiento'),
          ('CFGS Mantenimiento de Instalaciones Térmicas y de Fluidos', 'Instalación y Mantenimiento'),
          ('CFGM Instalaciones de Producción de Calor', 'Instalación y Mantenimiento'),
          ('CFGM Mantenimiento Electromecánico', 'Instalación y Mantenimiento'),
          ('CFGS Diseño y Amueblamiento', 'Madera, Mueble y Corcho'),
          ('CFGM Carpintería y Mueble', 'Madera, Mueble y Corcho'),
          ('CFGM Instalación y Amueblamiento', 'Madera, Mueble y Corcho'),
          ('CFGS Desarrollo y Fabricación de Productos Cerámicos', 'Vidrio y Cerámica'),
          ('CFGM Fabricación de Productos Cerámicos', 'Vidrio y Cerámica')
        ) AS c(name, familia_name)
        JOIN familias_profesionales f ON f.name = c.familia_name`);
    }

    const { rows: existingCenters } = await client.query("SELECT COUNT(*) as c FROM fp_centers");
    if (parseInt(existingCenters[0].c) === 0) {
      console.log("Insertando centros de FP de Canarias...");
      await client.query(`INSERT INTO fp_centers (name, municipio, isla) VALUES
        ('CIFP César Manrique', 'Santa Cruz de Tenerife', 'Tenerife'),
        ('CIFP Los Gladiolos', 'Santa Cruz de Tenerife', 'Tenerife'),
        ('CIFP San Cristóbal', 'Las Palmas de Gran Canaria', 'Gran Canaria'),
        ('CIFP Majada Marcial', 'Puerto del Rosario', 'Fuerteventura'),
        ('CIFP Zonzamas', 'Arrecife', 'Lanzarote'),
        ('CIFP Villa de Agüimes', 'Agüimes', 'Gran Canaria'),
        ('CIFP Cruz de Piedra', 'Las Palmas de Gran Canaria', 'Gran Canaria'),
        ('CIFP Las Indias', 'Santa Cruz de Tenerife', 'Tenerife'),
        ('CIFP Virgen de las Nieves', 'Santa Cruz de La Palma', 'La Palma'),
        ('IES El Rincón', 'Las Palmas de Gran Canaria', 'Gran Canaria'),
        ('IES Felo Monzón', 'Las Palmas de Gran Canaria', 'Gran Canaria'),
        ('IES Mesa y López', 'Las Palmas de Gran Canaria', 'Gran Canaria'),
        ('IES Politécnico Las Palmas', 'Las Palmas de Gran Canaria', 'Gran Canaria'),
        ('IES Cairasco de Figueroa', 'Las Palmas de Gran Canaria', 'Gran Canaria'),
        ('IES Tomás Morales', 'Las Palmas de Gran Canaria', 'Gran Canaria'),
        ('IES Pérez Galdós', 'Las Palmas de Gran Canaria', 'Gran Canaria'),
        ('IES Lila', 'Las Palmas de Gran Canaria', 'Gran Canaria'),
        ('IES Santa Brígida', 'Santa Brígida', 'Gran Canaria'),
        ('IES Ingenio', 'Ingenio', 'Gran Canaria'),
        ('IES Cruce de Arinaga', 'Agüimes', 'Gran Canaria'),
        ('IES Arguineguín', 'Mogán', 'Gran Canaria'),
        ('IES José Arencibia Gil', 'Telde', 'Gran Canaria'),
        ('IES Jinámar', 'Telde', 'Gran Canaria'),
        ('IES Las Huesas', 'Telde', 'Gran Canaria'),
        ('IES Lomo de la Herradura', 'Telde', 'Gran Canaria'),
        ('IES San Diego de Alcalá', 'Gáldar', 'Gran Canaria'),
        ('IES Guía', 'Santa María de Guía', 'Gran Canaria'),
        ('IES José Zerpa', 'Vecindario', 'Gran Canaria'),
        ('IES Playa de Arinaga', 'Agüimes', 'Gran Canaria'),
        ('IES Teror', 'Teror', 'Gran Canaria'),
        ('IES El Batán', 'Las Palmas de Gran Canaria', 'Gran Canaria'),
        ('IES Arucas-Domingo Rivero', 'Arucas', 'Gran Canaria'),
        ('IES Firgas', 'Firgas', 'Gran Canaria'),
        ('IES La Aldea', 'San Nicolás de Tolentino', 'Gran Canaria'),
        ('IES Maspalomas', 'San Bartolomé de Tirajana', 'Gran Canaria'),
        ('IES Santa Lucía', 'Santa Lucía de Tirajana', 'Gran Canaria'),
        ('IES Anaga', 'Santa Cruz de Tenerife', 'Tenerife'),
        ('IES El Sobradillo', 'Santa Cruz de Tenerife', 'Tenerife'),
        ('IES Poeta Viana', 'Santa Cruz de Tenerife', 'Tenerife'),
        ('IES Andrés Bello', 'Santa Cruz de Tenerife', 'Tenerife'),
        ('IES Benito Pérez Armas', 'Santa Cruz de Tenerife', 'Tenerife'),
        ('IES Teobaldo Power', 'Santa Cruz de Tenerife', 'Tenerife'),
        ('IES Alcalde Bernabé Rodríguez', 'Santa Cruz de Tenerife', 'Tenerife'),
        ('IES Las Veredillas', 'Santa Cruz de Tenerife', 'Tenerife'),
        ('IES Domingo Pérez Minik', 'San Cristóbal de La Laguna', 'Tenerife'),
        ('IES La Laboral', 'San Cristóbal de La Laguna', 'Tenerife'),
        ('IES Viera y Clavijo', 'San Cristóbal de La Laguna', 'Tenerife'),
        ('IES Padre Anchieta', 'San Cristóbal de La Laguna', 'Tenerife'),
        ('IES Geneto', 'San Cristóbal de La Laguna', 'Tenerife'),
        ('IES San Benito', 'San Cristóbal de La Laguna', 'Tenerife'),
        ('IES San Matías', 'Santa Cruz de Tenerife', 'Tenerife'),
        ('IES Guía de Isora', 'Guía de Isora', 'Tenerife'),
        ('IES Puerto de la Cruz', 'Puerto de la Cruz', 'Tenerife'),
        ('IES Agustín de Betancourt', 'Puerto de la Cruz', 'Tenerife'),
        ('IES Villalba Hervás', 'La Orotava', 'Tenerife'),
        ('IES Rafael Arozarena', 'La Orotava', 'Tenerife'),
        ('IES Los Realejos', 'Los Realejos', 'Tenerife'),
        ('IES Mencey Bencomo', 'Los Realejos', 'Tenerife'),
        ('IES Icod de los Vinos', 'Icod de los Vinos', 'Tenerife'),
        ('IES Granadilla', 'Granadilla de Abona', 'Tenerife'),
        ('IES Magallanes', 'Adeje', 'Tenerife'),
        ('IES Adeje', 'Adeje', 'Tenerife'),
        ('IES Santa Úrsula', 'Santa Úrsula', 'Tenerife'),
        ('IES Candelaria', 'Candelaria', 'Tenerife'),
        ('IES Güímar', 'Güímar', 'Tenerife'),
        ('IES Los Cristianos', 'Arona', 'Tenerife'),
        ('IES Cabo Blanco', 'Arona', 'Tenerife'),
        ('IES Arafo', 'Arafo', 'Tenerife'),
        ('IES San Nicolás', 'El Sauzal', 'Tenerife'),
        ('IES La Matanza', 'La Matanza de Acentejo', 'Tenerife'),
        ('IES La Victoria', 'La Victoria de Acentejo', 'Tenerife'),
        ('IES San Juan de la Rambla', 'San Juan de la Rambla', 'Tenerife'),
        ('IES Santiago del Teide', 'Santiago del Teide', 'Tenerife'),
        ('IES Vilaflor', 'Vilaflor', 'Tenerife'),
        ('IES La Guancha', 'La Guancha', 'Tenerife'),
        ('IES Buenavista', 'Buenavista del Norte', 'Tenerife'),
        ('IES San Miguel', 'San Miguel de Abona', 'Tenerife'),
        ('IES El Rosario', 'El Rosario', 'Tenerife'),
        ('IES Teguise', 'Teguise', 'Lanzarote'),
        ('IES San Bartolomé', 'San Bartolomé', 'Lanzarote'),
        ('IES Puerto del Carmen', 'Tías', 'Lanzarote'),
        ('IES Tinajo', 'Tinajo', 'Lanzarote'),
        ('IES Haría', 'Haría', 'Lanzarote'),
        ('IES Yaiza', 'Yaiza', 'Lanzarote'),
        ('IES Las Maretas', 'Arrecife', 'Lanzarote'),
        ('IES Blas Cabrera Felipe', 'Arrecife', 'Lanzarote'),
        ('IES Arrecife', 'Arrecife', 'Lanzarote'),
        ('IES Corralejo', 'La Oliva', 'Fuerteventura'),
        ('IES Vigán', 'Tuineje', 'Fuerteventura'),
        ('IES Gran Tarajal', 'Tuineje', 'Fuerteventura'),
        ('IES Jandía', 'Pájara', 'Fuerteventura'),
        ('IES Santo Tomás de Aquino', 'Puerto del Rosario', 'Fuerteventura'),
        ('IES Puerto del Rosario', 'Puerto del Rosario', 'Fuerteventura'),
        ('IES Alonso Pérez Díaz', 'Santa Cruz de La Palma', 'La Palma'),
        ('IES Las Breñas', 'Breña Baja', 'La Palma'),
        ('IES Puntagorda', 'Puntagorda', 'La Palma'),
        ('IES Cándido Marante Cachot', 'San Andrés y Sauces', 'La Palma'),
        ('IES El Paso', 'El Paso', 'La Palma'),
        ('IES Tijarafe', 'Tijarafe', 'La Palma'),
        ('IES Villa de Mazo', 'Villa de Mazo', 'La Palma'),
        ('IES Barlovento', 'Barlovento', 'La Palma'),
        ('IES Los Llanos', 'Los Llanos de Aridane', 'La Palma'),
        ('IES Eusebio Barreto Lorenzo', 'Los Llanos de Aridane', 'La Palma'),
        ('IES José María Pérez Pulido', 'Los Llanos de Aridane', 'La Palma'),
        ('IES San Sebastián de la Gomera', 'San Sebastián de La Gomera', 'La Gomera'),
        ('CEO Nereida Díaz Abreu', 'Valle Gran Rey', 'La Gomera'),
        ('CEO Mario Lhermet Silva', 'Hermigua', 'La Gomera'),
        ('CEO Vallehermoso', 'Vallehermoso', 'La Gomera'),
        ('CEO Santiago Apóstol', 'Alajeró', 'La Gomera'),
        ('IES Valverde', 'Valverde', 'El Hierro'),
        ('IES Garoé', 'El Pinar', 'El Hierro'),
        ('IES Roques de Salmor', 'Frontera', 'El Hierro')
        ON CONFLICT DO NOTHING`);
    }

    const { rows: existingAdmin } = await client.query("SELECT COUNT(*) as c FROM users WHERE email = 'admin@conectafp.es'");
    if (parseInt(existingAdmin[0].c) === 0) {
      console.log("Creando usuario administrador...");
      const adminHash = await bcrypt.hash("admin123", 12);
      await client.query(
        "INSERT INTO users (email, password, role, name, consent_given, email_verified) VALUES ($1, $2, 'ADMIN', 'Administrador', true, true) ON CONFLICT (email) DO NOTHING",
        ["admin@conectafp.es", adminHash]
      );
    }

    console.log("Datos de referencia verificados.");
  } finally {
    client.release();
  }
}

export async function seedDatabase() {
  await seedReferenceData();

  if (process.env.NODE_ENV === "production") return;

  const existingUser = await storage.getUserByEmail("empresa@techcorp.es");
  if (existingUser) return;

  console.log("Seeding database with initial data...");

  const companyPassword = await bcrypt.hash("password123", 12);
  const alumniPassword = await bcrypt.hash("password123", 12);
  const adminPassword = await bcrypt.hash("admin123", 12);

  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

  await storage.createUser({
    email: "admin@conectafp.es",
    password: adminPassword,
    role: "ADMIN",
    name: "Administrador",
    consentGiven: true,
    consentTimestamp: new Date(),
    profilePublic: false,
  });

  const company1 = await storage.createUser({
    email: "empresa@techcorp.es",
    password: companyPassword,
    role: "COMPANY",
    name: "Ana García",
    phone: "+34 911 234 567",
    companyName: "TechCorp Solutions",
    companyDescription: "Empresa líder en soluciones tecnológicas con más de 15 años de experiencia en el sector. Especializados en desarrollo de software, IA y cloud computing.",
    companyWebsite: "https://techcorp.es",
    companySector: "Tecnología",
    companyEmail: "info@techcorp.es",
    companyCif: "B12345678",
    consentGiven: true,
    consentTimestamp: new Date(),
    profilePublic: true,
  });

  const company2 = await storage.createUser({
    email: "rrhh@innovadigital.com",
    password: companyPassword,
    role: "COMPANY",
    name: "Carlos López",
    phone: "+34 912 345 678",
    companyName: "Innova Digital",
    companyDescription: "Agencia digital enfocada en transformación digital, marketing online y desarrollo de aplicaciones móviles.",
    companyWebsite: "https://innovadigital.com",
    companySector: "Marketing Digital",
    companyEmail: "contacto@innovadigital.com",
    companyCif: "B87654321",
    consentGiven: true,
    consentTimestamp: new Date(),
    profilePublic: true,
  });

  const company3 = await storage.createUser({
    email: "talento@greenenergy.es",
    password: companyPassword,
    role: "COMPANY",
    name: "Laura Martínez",
    phone: "+34 913 456 789",
    companyName: "GreenEnergy Systems",
    companyDescription: "Empresa de energía renovable comprometida con la sostenibilidad. Desarrollamos soluciones de energía solar y eólica.",
    companyWebsite: "https://greenenergy.es",
    companySector: "Energía Renovable",
    companyEmail: "info@greenenergy.es",
    companyCif: "A11223344",
    consentGiven: true,
    consentTimestamp: new Date(),
    profilePublic: true,
  });

  const alumni1 = await storage.createUser({
    email: "maria@alumni.com",
    password: alumniPassword,
    role: "ALUMNI",
    name: "María Fernández",
    phone: "+34 620 123 456",
    bio: "Titulada en Desarrollo de Aplicaciones Web (DAW) con pasión por el desarrollo web y la inteligencia artificial. Busco mi primera oportunidad profesional.",
    university: "IES Vallecas",
    graduationYear: 2024,
    familiaProfesional: "Informática y Comunicaciones",
    cicloFormativo: "CFGS Desarrollo de Aplicaciones Web (DAW)",
    skills: "JavaScript, TypeScript, React, Node.js, Python, SQL",
    cvUrl: "https://drive.google.com/example-cv-maria",
    consentGiven: true,
    consentTimestamp: new Date(),
    profilePublic: false,
  });

  const alumni2 = await storage.createUser({
    email: "pablo@alumni.com",
    password: alumniPassword,
    role: "ALUMNI",
    name: "Pablo Rodríguez",
    phone: "+34 630 234 567",
    bio: "Técnico superior en Administración de Sistemas Informáticos en Red (ASIR) con experiencia en prácticas. Especializado en backend y arquitectura de microservicios.",
    university: "IES Joan d'Austria",
    graduationYear: 2023,
    familiaProfesional: "Informática y Comunicaciones",
    cicloFormativo: "CFGS Administración de Sistemas Informáticos en Red (ASIR)",
    skills: "Java, Spring Boot, Docker, Kubernetes, AWS, PostgreSQL",
    cvUrl: "https://drive.google.com/example-cv-pablo",
    consentGiven: true,
    consentTimestamp: new Date(),
    profilePublic: false,
  });

  const job1 = await storage.createJob(company1.id, {
    title: "Desarrollador Full-Stack Junior",
    description: "Buscamos un desarrollador full-stack para unirse a nuestro equipo de innovación. Trabajarás en proyectos de alta tecnología con las últimas herramientas del mercado. Ofrecemos formación continua y un ambiente de trabajo dinámico.",
    location: "Madrid, España",
    salaryMin: 25000,
    salaryMax: 35000,
    jobType: "FULL_TIME",
    requirements: "Título de FP en DAW, DAM o similar. Conocimientos de JavaScript, React y Node.js. Nivel de inglés B2.",
    familiaProfesional: "Informática y Comunicaciones",
    cicloFormativo: "CFGS Desarrollo de Aplicaciones Web (DAW)",
    expiresAt: threeMonthsFromNow,
  });

  const job2 = await storage.createJob(company1.id, {
    title: "Data Scientist - IA",
    description: "Incorporamos un Data Scientist para nuestro departamento de Inteligencia Artificial. Participarás en proyectos de machine learning y análisis de datos a gran escala.",
    location: "Madrid (Híbrido)",
    salaryMin: 30000,
    salaryMax: 45000,
    jobType: "FULL_TIME",
    requirements: "FP Superior o formación equivalente en Data Science. Experiencia con Python, TensorFlow, pandas. Conocimientos de estadística avanzada.",
    familiaProfesional: "Informática y Comunicaciones",
    cicloFormativo: "CFGS Desarrollo de Aplicaciones Multiplataforma (DAM)",
    expiresAt: threeMonthsFromNow,
  });

  const job3 = await storage.createJob(company2.id, {
    title: "Diseñador UX/UI - Prácticas",
    description: "Ofrecemos prácticas remuneradas en diseño UX/UI. Aprenderás a crear interfaces de usuario atractivas y funcionales para clientes de primer nivel.",
    location: "Barcelona, España",
    salaryMin: 12000,
    salaryMax: 15000,
    jobType: "INTERNSHIP",
    requirements: "Estudiante o recién titulado en FP de Diseño o similar. Portfolio de proyectos. Manejo de Figma y Adobe XD.",
    familiaProfesional: "Imagen y Sonido",
    cicloFormativo: "CFGS Animaciones 3D, Juegos y Entornos Interactivos",
    expiresAt: threeMonthsFromNow,
  });

  const job4 = await storage.createJob(company2.id, {
    title: "Community Manager",
    description: "Gestionarás las redes sociales de nuestros clientes más importantes. Creación de contenido, análisis de métricas y estrategias de crecimiento.",
    location: "Remoto",
    salaryMin: 20000,
    salaryMax: 28000,
    jobType: "REMOTE",
    requirements: "FP en Marketing y Publicidad, Comunicación o similar. Experiencia con herramientas de gestión de RRSS. Creatividad y capacidad analítica.",
    familiaProfesional: "Comercio y Marketing",
    cicloFormativo: "CFGS Marketing y Publicidad",
    expiresAt: threeMonthsFromNow,
  });

  const job5 = await storage.createJob(company3.id, {
    title: "Ingeniero de Energías Renovables",
    description: "Buscamos ingeniero para diseñar e implementar soluciones de energía solar fotovoltaica en proyectos residenciales y comerciales.",
    location: "Valencia, España",
    salaryMin: 28000,
    salaryMax: 38000,
    jobType: "FULL_TIME",
    requirements: "FP Superior en Energías Renovables, Electricidad o similar. Conocimientos en energía solar. Carnet de conducir B.",
    familiaProfesional: "Energía y Agua",
    cicloFormativo: "CFGS Energías Renovables",
    expiresAt: threeMonthsFromNow,
  });

  await storage.createApplication(alumni1.id, {
    jobOfferId: job1.id,
    coverLetter: "Me apasiona el desarrollo full-stack y creo que mi formación en React y Node.js encaja perfectamente con lo que buscan. Estoy deseando aportar valor a su equipo.",
  });

  await storage.createApplication(alumni2.id, {
    jobOfferId: job1.id,
    coverLetter: "Aunque mi especialidad es backend, tengo sólidos conocimientos full-stack y experiencia en prácticas que me permitirían adaptarme rápidamente.",
  });

  await storage.createApplication(alumni1.id, {
    jobOfferId: job3.id,
    coverLetter: "Aunque mi formación es en informática, siempre he tenido interés por el diseño y tengo experiencia personal creando interfaces con Figma.",
  });

  console.log("Database seeded successfully!");
}
