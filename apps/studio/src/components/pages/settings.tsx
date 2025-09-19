export function SettingsPage(props: Props) {
  const { settings, onClickLogout } = props;
  return (
    <div>
      <ul>
        {Object.entries(settings).map(([key, value]) => (
          <li key={key}>
            {key}: {value}
          </li>
        ))}
        <li>
          <button onClick={onClickLogout}>Logout</button>
        </li>
      </ul>
    </div>
  );
}

type Props = {
  settings: Record<string, string>;
  onClickLogout: () => Promise<void> | void;
};
