/*
 * This file is part of Universal Media Server, based on PS3 Media Server.
 *
 * This program is a free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation; version 2 of the License only.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program; if not, write to the Free Software Foundation, Inc., 51
 * Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 */
package net.pms.renderers;

import java.nio.file.Path;
import net.pms.PMS;
import net.pms.configuration.UmsConfiguration;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

public class RendererPlaybackModeTest {
	@BeforeAll
	public static void setUpClass() throws Exception {
		System.setProperty(PMS.PROPERTY_RUNNING_TESTS, "true");
		PMS.setConfiguration(new UmsConfiguration(false));
	}

	@TempDir
	Path temporaryDirectory;

	@Test
	public void testModeProperties() {
		assertFalse(RendererPlaybackMode.AUTOMATIC.isRemote());
		assertTrue(RendererPlaybackMode.LOCAL_DIRECT_PLAY.isForceDirectPlay());
		assertEquals(8, RendererPlaybackMode.REMOTE_8_MBPS.getMaximumBitrateMbps());
		assertEquals(4, RendererPlaybackMode.REMOTE_4_MBPS.getMaximumBitrateMbps());
		assertEquals(RendererPlaybackMode.AUTOMATIC, RendererPlaybackMode.fromPersistedValue("not-a-mode"));
	}

	@Test
	public void testModePersistence() {
		Path storePath = temporaryDirectory.resolve("renderer-playback-modes.properties");
		RendererPlaybackModeStore store = new RendererPlaybackModeStore(storePath);
		store.set("phone", RendererPlaybackMode.REMOTE_8_MBPS);

		RendererPlaybackModeStore reloadedStore = new RendererPlaybackModeStore(storePath);
		assertEquals(RendererPlaybackMode.REMOTE_8_MBPS, reloadedStore.get("phone"));

		reloadedStore.set("phone", RendererPlaybackMode.AUTOMATIC);
		assertEquals(
			RendererPlaybackMode.AUTOMATIC,
			new RendererPlaybackModeStore(storePath).get("phone")
		);
	}

	@Test
	public void testLocalDirectPlayAlwaysBypassesBitrateDetection() throws Exception {
		Renderer renderer = rendererFor(RendererPlaybackMode.LOCAL_DIRECT_PLAY);
		assertEquals(0, renderer.getMaxVideoBitrate());
		assertEquals("*", renderer.getStreamedExtensions());
		assertTrue(renderer.isTranscodingDisabledForPlaybackMode());
	}

	@Test
	public void testRemoteModesEnforceTheirOwnBitrateChecks() throws Exception {
		Renderer remote8 = rendererFor(RendererPlaybackMode.REMOTE_8_MBPS);
		Renderer remote4 = rendererFor(RendererPlaybackMode.REMOTE_4_MBPS);
		assertEquals(8, remote8.getMaxVideoBitrate());
		assertEquals(4, remote4.getMaxVideoBitrate());
		assertEquals("", remote8.getStreamedExtensions());
		assertFalse(remote8.isTranscodingDisabledForPlaybackMode());
	}

	private static Renderer rendererFor(RendererPlaybackMode mode) throws Exception {
		return new Renderer((String) null) {
			@Override
			public RendererPlaybackMode getPlaybackMode() {
				return mode;
			}
		};
	}
}
