import React from 'react';

export const FooterBandeau: React.FC = () => {
  return (
    <footer tabIndex={0} className="group fixed inset-x-0 bottom-0 z-50 h-70 translate-y-[calc(100%_-_2.25rem)] overflow-hidden bg-[#B51621] px-5 text-white transition-transform duration-300 ease-out hover:translate-y-0 focus-visible:translate-y-0 has-[:focus-visible]:translate-y-0 motion-reduce:transition-none">
      <p className="pointer-events-none absolute inset-x-0 top-0 flex h-9 items-center justify-center text-sm transition-opacity duration-300 group-hover:opacity-0 group-focus-visible:opacity-0 group-has-[:focus-visible]:opacity-0 motion-reduce:transition-none">
        Droits réservés © {new Date().getFullYear()} SAOE
      </p>
      <div className="flex h-full items-center justify-between gap-5 px-[5%]">
        <div className="min-w-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 group-has-[:focus-visible]:opacity-100 motion-reduce:transition-none">
          <h2 className="text-center text-2xl font-bold">Dévoleppé avec <img src="/heart.png" alt="" className='invert inline-block h-6 w-auto'/> par :</h2>
          <div className="mt-4 flex gap-5 overflow-x-auto">
            <div className="flex flex-col items-center text-center">
              <p><span className='font-bold'>Mael Retault :</span> <br />mael.retault@etu.unilim.fr</p>
              <div className="mt-2 grid size-35 shrink-0 place-items-center">
                <img src="/mael.jpg" alt="Mael Retault" className="size-32 rounded-xl object-cover transition-[width,height] duration-300 hover:size-35 motion-reduce:transition-none" />
              </div>
            </div>
            <div className="flex flex-col items-center text-center">
              <p><span className='font-bold'>Emile Delpey :</span> <br />emile.delpey@etu.unilim.fr</p>
              <div className="mt-2 grid size-35 shrink-0 place-items-center">
                <img src="/emile.jpg" alt="Emile Delpey" className="size-32 rounded-xl object-cover transition-[width,height] duration-300 hover:size-35 motion-reduce:transition-none" />
              </div>
            </div>
            <div className="flex flex-col items-center text-center">
              <p><span className='font-bold'>Trystan Deneuve :</span> <br />trystan.deneuve@etu.unilim.fr</p>
              <div className="mt-2 grid size-35 shrink-0 place-items-center">
                <img src="/trystan.jpg" alt="Trystan Deneuve" className="size-32 rounded-xl object-cover transition-[width,height] duration-300 hover:size-35 motion-reduce:transition-none" />
              </div>
            </div>
            <div className="flex flex-col items-center text-center">
              <p><span className='font-bold'>Emile Merceron :</span> <br />emile.merceron@etu.unilim.fr</p>
              <div className="mt-2 grid size-35 shrink-0 place-items-center">
                <img src="/emileM.jpg" alt="Emile Merceron" className="size-32 rounded-xl object-cover transition-[width,height] duration-300 hover:size-35 motion-reduce:transition-none" />
              </div>
            </div>
            <div className="flex flex-col items-center text-center">
              <p><span className='font-bold'>Geoffrey Rigal :</span> <br />geoffrey.rigal@etu.unilim.fr</p>
              <div className="mt-2 grid size-35 shrink-0 place-items-center">
                <img src="/geoffrey.jpg" alt="Geoffrey Rigal" className="size-32 rounded-xl object-cover transition-[width,height] duration-300 hover:size-35 motion-reduce:transition-none" />
              </div>
            </div>
          </div>
        </div>
        <div className="self-center flex shrink-0 flex-col items-center text-center">
          <p><span className='font-bold'>Dépot GitHub SAOE</span></p>
          <a href="https://github.com/SticksOnTheBeach/SAOE" target='_blank' rel="noopener noreferrer"><img src="/github.png" alt="Ouvrir le dépôt GitHub de SAOE" className='size-32 object-cover rounded-xl mt-2 invert hover:invert-[90%]'/></a>
        </div>
      </div>
    </footer>
  );
};
