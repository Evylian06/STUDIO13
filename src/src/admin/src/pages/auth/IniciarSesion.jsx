import { useState } from 'react';
import '../../App.css';
import logoNegro from '../../assets/studio13_negro.PNG';
import logoBlanco from '../../assets/Studio13_blanco.png';

const portada = 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1600&h=1800&fit=crop&auto=format&q=90';

function IniciarSesion() {
	const [isRecovery, setIsRecovery] = useState(false);
	const [recoverySubmitted, setRecoverySubmitted] = useState(false);

	function handleSubmit(event) {
		event.preventDefault();
		if (isRecovery) setRecoverySubmitted(true);
	}

	return (
		<main className="studio-login">
			<section className="studio-login__access">
				<header className="studio-login__header">
					<img src={logoNegro} alt="Studio13" className="studio-login__logo" />
					<span className="studio-login__header-note">Administración</span>
				</header>

				<div className={`studio-login__content${isRecovery ? ' studio-login__content--recovery' : ''}`}>
					<p className="studio-login__eyebrow">{isRecovery ? 'Recuperación de acceso' : <>Workspace <span>·</span> Studio13</>}</p>
					<h1 className="studio-login__title">
						{isRecovery ? <>Recupera tu<br /><em>acceso.</em></> : <>Studio13<br /><em>Admin</em></>}
					</h1>
					<p className="studio-login__intro">
						{isRecovery ? 'Indica el correo asociado a tu cuenta para solicitar instrucciones.' : 'Panel de administración para gestionar el flujo de trabajo del estudio.'}
					</p>

					{!isRecovery && <section className="studio-login__modules" aria-label="Áreas del panel">
						<div className="studio-login__modules-heading">
							<span>Áreas de gestión</span>
							<span className="studio-login__modules-rule" aria-hidden="true" />
						</div>
						<ul className="studio-login__modules-list">
							<li><span>01</span><strong>Galerías</strong></li>
							<li><span>02</span><strong>Sesiones</strong></li>
							<li><span>03</span><strong>Clientes</strong></li>
							<li><span>04</span><strong>Publicaciones</strong></li>
						</ul>
					</section>}

					<form className="studio-login__form" onSubmit={handleSubmit}>
						<div className="studio-login__field">
							<label htmlFor="email">Correo electrónico</label>
							<input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								placeholder="nombre@studio13.com"
								required
							/>
						</div>

						{!isRecovery && <div className="studio-login__field">
							<div className="studio-login__label-row">
								<label htmlFor="password">Contraseña</label>
								<button
									type="button"
									className="studio-login__forgot"
									onClick={() => { setIsRecovery(true); setRecoverySubmitted(false); }}
								>
									¿Olvidaste tu contraseña?
								</button>
							</div>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="current-password"
								placeholder="••••••••••••"
								required
							/>
						</div>}

						<button className="studio-login__submit" type="submit">
							<span>{isRecovery ? 'Solicitar instrucciones' : 'Iniciar sesión'}</span>
							<span className="studio-login__arrow" aria-hidden="true">→</span>
						</button>
					</form>

					{isRecovery && <div className="studio-login__recovery-actions">
						{recoverySubmitted && <p className="studio-login__notice" role="status">La vista está lista. Para enviar el enlace hay que conectar el servicio de correo.</p>}
						<button
							type="button"
							className="studio-login__back"
							onClick={() => { setIsRecovery(false); setRecoverySubmitted(false); }}
						>
							Volver a iniciar sesión
						</button>
					</div>}
				</div>

				<footer className="studio-login__footer">
					<span>Acceso reservado al equipo</span>
					<span>© Studio13</span>
				</footer>
			</section>

			<aside className="studio-login__visual" aria-label="Fotografía de Studio13">
				<img className="studio-login__photo" src={portada} alt="" />
				<div className="studio-login__shade" aria-hidden="true" />
				<div className="studio-login__frame" aria-hidden="true" />
				<header className="studio-login__visual-header">
					<img src={logoBlanco} alt="" className="studio-login__visual-logo" />
					<span>Puerto Cito <i /> Costa Rica</span>
				</header>
				<div className="studio-login__visual-copy">
					<p className="studio-login__visual-kicker">Archivo fotográfico <span>—</span> Studio13</p>
					<p className="studio-login__visual-title">Retrato <i /> Bodas <i /> Editorial</p>
				</div>
				<div className="studio-login__visual-meta">
					<span>Fotografía profesional</span>
					<span>ST13 / 001</span>
				</div>
			</aside>
		</main>
	);
}

export default IniciarSesion;
