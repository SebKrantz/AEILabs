import Globe from "@/components/Globe";
import Navbar from "@/components/Navbar";
import HeroContent from "@/components/HeroContent";

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <Navbar />
      <div className="relative h-screen">
        <Globe />
        <HeroContent />
      </div>
    </div>
  );
};

export default Index;
