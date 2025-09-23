import { UserButton, useUser } from '@clerk/nextjs';
import { ListTree, Menu, PackagePlus, ShoppingBasket, Warehouse, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react';
import { checkAndAddCommerce } from '../actions';
import Stock from './Stock';

interface LinkItem {
  label: string;
  href: string;
  icon: any;
}

const Navbar: React.FC = () => {

  const {user} = useUser()


  const pathname = usePathname()
    const [menuOpen, setMenuOpen] = React.useState(false);

  const navLinks: LinkItem[] = [
    { label: 'Ma liste', href: '/products', icon: ShoppingBasket},
    { label: 'Catégories', href: '/category', icon: ListTree},
    { label: 'Nouveau produit', href: '/newproduct', icon: PackagePlus},
  ];

  useEffect(() => {
    if(user?.primaryEmailAddress?.emailAddress && user?.fullName){
        checkAndAddCommerce(user?.primaryEmailAddress?.emailAddress, user?.fullName)
      }
    }, [user])

  const renderLinks = (baseClass: string) => (
    <>
      {navLinks.map(({ label, href, icon: Icon }) => {
        const isActive = pathname === href;
        const activeClass = isActive ? 'btn-primary text-white' : 'btn-ghost';
        return (
          <Link
            key={href}
            href={href}
            className={`${baseClass} ${activeClass} btn-sm flex gap-2 items-center`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        );
      })}
      <button className="btn btn-sm" 
      onClick={()=>(document.getElementById('my_modal_stock') as HTMLDialogElement).showModal()}>
        <Warehouse className='h-4 w-4' />
        Approvisionner le stock
      </button>
    </>
  );

  return (
    <div className="border-b border-base-300 px-5 md:px-[10%] py-4 relative">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="p-2">
            <PackagePlus className="w-6 h-6 text-primary" />
          </div>
          <span className="font-bold text-xl">EasyStock</span>
        </div>

        <button 
        className='btn w-fit sm:hidden btn-sm'
        onClick={() => setMenuOpen(!menuOpen)}
        >
            <Menu className='w-4 h-4' />
        </button>

        <div className="hidden space-x-2 sm:flex items-center">
          {renderLinks('btn')}
           <UserButton />
          </div>
      </div>

      <div className={`absolute top-0 w-full bg-base-100 h-screen flex flex-col gap-2 p-4 transition-all duration-300 sm:hidden z-50 ${menuOpen ? 'left-0' : '-left-full'}`}>
        <div className='flex justify-between'>
           <UserButton />
             <button 
            className='btn w-fit sm:hidden btn-sm'
            onClick={() => setMenuOpen(!menuOpen)}
            >
            <X className='w-4 h-4' />
        </button>
        </div>
        {renderLinks('btn w-full')}
      </div>
      <Stock />
    </div>
  );
};

export default Navbar;
