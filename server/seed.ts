import bcrypt from "bcrypt";
import { storage } from "./storage";

export async function seedDatabase() {
  const existingUser = await storage.getUserByEmail("empresa@techcorp.es");
  if (existingUser) return;

  console.log("Seeding database with initial data...");

  const companyPassword = await bcrypt.hash("password123", 12);
  const alumniPassword = await bcrypt.hash("password123", 12);

  const company1 = await storage.createUser({
    email: "empresa@techcorp.es",
    password: companyPassword,
    role: "COMPANY",
    name: "Ana Garcia",
    phone: "+34 911 234 567",
    companyName: "TechCorp Solutions",
    companyDescription: "Empresa lider en soluciones tecnologicas con mas de 15 anos de experiencia en el sector. Especializados en desarrollo de software, IA y cloud computing.",
    companyWebsite: "https://techcorp.es",
    companySector: "Tecnologia",
    consentGiven: true,
    consentTimestamp: new Date(),
    profilePublic: true,
  });

  const company2 = await storage.createUser({
    email: "rrhh@innovadigital.com",
    password: companyPassword,
    role: "COMPANY",
    name: "Carlos Lopez",
    phone: "+34 912 345 678",
    companyName: "Innova Digital",
    companyDescription: "Agencia digital enfocada en transformacion digital, marketing online y desarrollo de aplicaciones moviles.",
    companyWebsite: "https://innovadigital.com",
    companySector: "Marketing Digital",
    consentGiven: true,
    consentTimestamp: new Date(),
    profilePublic: true,
  });

  const company3 = await storage.createUser({
    email: "talento@greenenergy.es",
    password: companyPassword,
    role: "COMPANY",
    name: "Laura Martinez",
    phone: "+34 913 456 789",
    companyName: "GreenEnergy Systems",
    companyDescription: "Empresa de energia renovable comprometida con la sostenibilidad. Desarrollamos soluciones de energia solar y eolica.",
    companyWebsite: "https://greenenergy.es",
    companySector: "Energia Renovable",
    consentGiven: true,
    consentTimestamp: new Date(),
    profilePublic: true,
  });

  const alumni1 = await storage.createUser({
    email: "maria@alumni.com",
    password: alumniPassword,
    role: "ALUMNI",
    name: "Maria Fernandez",
    phone: "+34 620 123 456",
    bio: "Graduada en Ingenieria Informatica con pasion por el desarrollo web y la inteligencia artificial. Busco mi primera oportunidad profesional.",
    university: "Universidad Politecnica de Madrid",
    graduationYear: 2024,
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
    name: "Pablo Rodriguez",
    phone: "+34 630 234 567",
    bio: "Ingeniero de software con experiencia en practicas. Especializado en backend y arquitectura de microservicios.",
    university: "Universidad de Barcelona",
    graduationYear: 2023,
    skills: "Java, Spring Boot, Docker, Kubernetes, AWS, PostgreSQL",
    cvUrl: "https://drive.google.com/example-cv-pablo",
    consentGiven: true,
    consentTimestamp: new Date(),
    profilePublic: false,
  });

  const job1 = await storage.createJob(company1.id, {
    title: "Desarrollador Full-Stack Junior",
    description: "Buscamos un desarrollador full-stack para unirse a nuestro equipo de innovacion. Trabajaras en proyectos de alta tecnologia con las ultimas herramientas del mercado. Ofrecemos formacion continua y un ambiente de trabajo dinamico.",
    location: "Madrid, Espana",
    salaryMin: 25000,
    salaryMax: 35000,
    jobType: "FULL_TIME",
    requirements: "Grado en Informatica o similar. Conocimientos de JavaScript, React y Node.js. Nivel de ingles B2.",
  });

  const job2 = await storage.createJob(company1.id, {
    title: "Data Scientist - IA",
    description: "Incorporamos un Data Scientist para nuestro departamento de Inteligencia Artificial. Participaras en proyectos de machine learning y analisis de datos a gran escala.",
    location: "Madrid (Hibrido)",
    salaryMin: 30000,
    salaryMax: 45000,
    jobType: "FULL_TIME",
    requirements: "Master en Data Science o similar. Experiencia con Python, TensorFlow, pandas. Conocimientos de estadistica avanzada.",
  });

  const job3 = await storage.createJob(company2.id, {
    title: "Disenador UX/UI - Practicas",
    description: "Ofrecemos practicas remuneradas en diseno UX/UI. Aprenderas a crear interfaces de usuario atractivas y funcionales para clientes de primer nivel.",
    location: "Barcelona, Espana",
    salaryMin: 12000,
    salaryMax: 15000,
    jobType: "INTERNSHIP",
    requirements: "Estudiante o recien graduado en Diseno. Portfolio de proyectos. Manejo de Figma y Adobe XD.",
  });

  const job4 = await storage.createJob(company2.id, {
    title: "Community Manager",
    description: "Gestionaras las redes sociales de nuestros clientes mas importantes. Creacion de contenido, analisis de metricas y estrategias de crecimiento.",
    location: "Remoto",
    salaryMin: 20000,
    salaryMax: 28000,
    jobType: "REMOTE",
    requirements: "Grado en Comunicacion, Marketing o similar. Experiencia con herramientas de gestion de RRSS. Creatividad y capacidad analitica.",
  });

  const job5 = await storage.createJob(company3.id, {
    title: "Ingeniero de Energias Renovables",
    description: "Buscamos ingeniero para disenar e implementar soluciones de energia solar fotovoltaica en proyectos residenciales y comerciales.",
    location: "Valencia, Espana",
    salaryMin: 28000,
    salaryMax: 38000,
    jobType: "FULL_TIME",
    requirements: "Grado en Ingenieria Energetica, Electrica o similar. Conocimientos en energia solar. Carnet de conducir B.",
  });

  await storage.createApplication(alumni1.id, {
    jobOfferId: job1.id,
    coverLetter: "Me apasiona el desarrollo full-stack y creo que mi formacion en React y Node.js encaja perfectamente con lo que buscan. Estoy deseando aportar valor a su equipo.",
  });

  await storage.createApplication(alumni2.id, {
    jobOfferId: job1.id,
    coverLetter: "Aunque mi especialidad es backend, tengo solidos conocimientos full-stack y experiencia en practicas que me permitirian adaptarme rapidamente.",
  });

  await storage.createApplication(alumni1.id, {
    jobOfferId: job3.id,
    coverLetter: "Aunque mi formacion es en informatica, siempre he tenido interes por el diseno y tengo experiencia personal creando interfaces con Figma.",
  });

  console.log("Database seeded successfully!");
}
