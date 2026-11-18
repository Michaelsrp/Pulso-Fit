function Switch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v:boolean)=>void }) { return <button type="button" role="switch" aria-checked={checked} aria-label={label} className={`switch ${checked?"on":""}`} onClick={()=>onChange(!checked)}><span aria-hidden="true"/></button>; }

export default Switch;
