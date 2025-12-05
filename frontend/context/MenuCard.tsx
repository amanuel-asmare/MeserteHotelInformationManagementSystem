'use client';
import { useLanguage } from './LanguageContext';

// Define Interface based on new Schema
interface MenuItem {
  _id: string;
  name: { en: string; am: string }; 
  description: { en: string; am: string };
  price: number;
  image: string;
}

export default function MenuCard({ item }: { item: MenuItem }) {
  const { language } = useLanguage(); // 'en' or 'am'

  return (
    <div className="card">
      <img src={item.image} alt="food" />
      
      {/* ACCESS DATA DYNAMICALLY */}
      <h3>{item.name[language]}</h3> 
      
      <p>{item.description[language]}</p>
      
      <span className="price">ETB {item.price}</span>
    </div>
  );
}