function HomePage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] justify-center ">
      <div className="flex flex-col text-center gap-10">

        <div className="flex flex-col text-center gap-2">
          <h1 className="text-3xl text-[#B51621]">BIENVENUE SUR SAOE</h1>
          <h2 className="text-2xl text-[#B51621]">Le système de génération de plan de classe</h2>
        </div> 

        <div className="siwe flex flex-col gap-2">
          <p className="text-[#B51621]">Afin de créer vos promos et groupes d'élève allez dans le menus indiqué:</p>
          <img src="/tuto_promos.png" alt="Comment créer sa promo"  className="h-15 w-250" />
        </div>
        <div className="siwe flex flex-col gap-2">
          <p className="text-[#B51621]">Vous pouvez ensuite créer une salle de classe, ou en utiliser une déjà enregistrée:</p>
          <img src="/tuto_salles1.png" alt="Comment créer sa salle part.1"  className="h-15 w-250" />
        </div>
        <div className="siwe flex flex-col gap-2">
          <p className="text-[#B51621]">Pour en créer une nouvelle:</p>
          <img src="/tuto_salles2.png" alt="Comment créer sa salle part.2"  className="h-45 w-250" />
        </div>

      </div>

    </div>
  )
}

export default HomePage